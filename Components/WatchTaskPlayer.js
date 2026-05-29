"use client";

import { useEffect, useRef, useState } from "react";
import AdsterraSocialBar from "./AdsterraSocialBar";

const YT_SRC = "https://www.youtube.com/iframe_api";

function getYouTubeVideoId(input) {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.replace("www.", "");

    if (host === "youtu.be") return url.pathname.slice(1);
    if (host.includes("youtube.com")) return url.searchParams.get("v") || "";
    return "";
  } catch {
    return "";
  }
}

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    if (!document.querySelector(`script[src="${YT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = YT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
  });
}

export default function WatchTaskPlayer({ task, onClose, onComplete }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task?.duration || 0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [verifying, setVerifying] = useState(false);

  const [debug, setDebug] = useState({
    rawUrl: task?.url || task?.videoId || "",
    videoId: getYouTubeVideoId(task?.url || task?.videoId || ""),
    error: "",
    state: "idle",
    mounted: false,
  });

  useEffect(() => {
    let mounted = true;
    const videoId = getYouTubeVideoId(task?.url || task?.videoId || "");

    setReady(false);
    setPlaying(false);
    setTimeLeft(task?.duration || 0);
    setShowQuiz(false);
    setAnswers({});
    setVerifying(false);

    setDebug({
      rawUrl: task?.url || task?.videoId || "",
      videoId,
      error: "",
      state: "loading",
      mounted: true,
    });

    async function init() {
      if (!videoId || !containerRef.current) {
        setDebug((prev) => ({
          ...prev,
          error: "Invalid or missing YouTube video ID",
          state: "invalid-id",
        }));
        return;
      }

      const YT = await loadYouTubeAPI();
      if (!mounted) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setReady(true);
            setDebug((prev) => ({ ...prev, state: "ready" }));
          },
          onStateChange: (event) => {
            const state = event.data;
            setDebug((prev) => ({ ...prev, state: String(state) }));

            if (state === YT.PlayerState.PLAYING) {
              setPlaying(true);
            }

            if (state === YT.PlayerState.PAUSED) {
              setPlaying(false);
            }

            if (state === YT.PlayerState.ENDED) {
              setPlaying(false);
              setShowQuiz(true);
              clearInterval(timerRef.current);
              setTimeLeft(0);
            }
          },
          onError: (event) => {
            setDebug((prev) => ({
              ...prev,
              error: `YouTube error code: ${event.data}`,
              state: "error",
            }));
          },
        },
      });
    }

    init();

    return () => {
      mounted = false;
      clearInterval(timerRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [task]);

  useEffect(() => {
    clearInterval(timerRef.current);

    if (playing && !showQuiz && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
            setShowQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, showQuiz, timeLeft]);

  const startWatching = () => {
    setDebug((prev) => ({ ...prev, state: "play-clicked" }));
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    } else {
      setDebug((prev) => ({
        ...prev,
        error: "playVideo() not available yet",
      }));
    }
  };

  const submitQuiz = async () => {
    if (!task?.questions?.length) {
      onComplete?.({ quizPassed: true, watched: true });
      return;
    }

    setVerifying(true);
    try {
      const allCorrect = task.questions.every(
        (q) => answers[q.id] === q.correctAnswer
      );

      if (!allCorrect) {
        alert("Wrong answers. Try again.");
        return;
      }

      onComplete?.({ quizPassed: true, watched: true });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <AdsterraSocialBar />
      <div style={styles.head}>
        <div>
          <h2 style={{ margin: 0 }}>{task?.title || "Watch Task"}</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>
            Reward: ${task?.reward || 0}
          </p>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>X</button>
      </div>

      <div style={styles.playerBox} ref={containerRef} />

      <div style={styles.infoRow}>
        <span>Duration: {task?.duration || 0}s</span>
        <span>Time left: {timeLeft}s</span>
      </div>

    {process.env.NODE_ENV === "development" && (
      <div style={styles.debugBox}>
        <div><strong>Debug</strong></div>
        <div>Raw URL: {String(debug.rawUrl || "none")}</div>
        <div>Video ID: {String(debug.videoId || "none")}</div>
        <div>Status: {debug.state}</div>
        <div>Error: {debug.error || "none"}</div>
        <div>Ready: {String(ready)}</div>
        <div>Playing: {String(playing)}</div>
      </div>
    )}

      {!showQuiz ? (
        <div style={styles.actions}>
          <button onClick={startWatching} disabled={!ready} style={styles.playBtn}>
            {ready ? "Start Watching" : "Loading..."}
          </button>
        </div>
      ) : (
        <div style={styles.quiz}>
          <h3 style={{ marginTop: 0 }}>Quiz</h3>

          {task?.questions?.length ? (
            task.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: 18 }}>
                <p style={{ marginBottom: 10 }}>{q.question}</p>

                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt;

                  return (
                    <label
                      key={opt}
                      style={{
                        ...styles.option,
                        ...(selected ? styles.optionSelected : {}),
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={selected}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        style={styles.radio}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ))
          ) : (
            <p>No quiz for this task.</p>
          )}

          <button
            onClick={submitQuiz}
            disabled={verifying}
            style={styles.claimBtn}
          >
            {verifying ? "Verifying..." : "Submit Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: 20,
    padding: 16,
    border: "1px solid #2f3542",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    position: "relative",
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    border: "none",
    background: "#4b5563",
    color: "#fff",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
  },
  playerBox: {
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    color: "#d1d5db",
  },
  debugBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: "#0b1220",
    color: "#dbeafe",
    fontSize: 13,
    lineHeight: 1.6,
    border: "1px solid #1f2a44",
  },
  actions: {
    marginTop: 14,
  },
  playBtn: {
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },
  quiz: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    background: "#0f172a",
  },
  option: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
    cursor: "pointer",
    padding: "10px 12px",
    border: "1px solid #334155",
    borderRadius: 8,
    transition: "0.2s ease",
  },
  optionSelected: {
    background: "#1e293b",
    borderColor: "#3b82f6",
    color: "#fff",
  },
  radio: {
    accentColor: "#3b82f6",
    cursor: "pointer",
  },
  claimBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },
};