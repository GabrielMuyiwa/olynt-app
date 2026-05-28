import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { MdGeneratingTokens } from "../Components/ReactICON/index";

const Header = ({ page }) => {
  const { address } = useAccount();

  const navigation = [
    { name: "Home", link: "#home" },
    { name: "Staking", link: "#staking" },
    { name: "Crypto", link: "#crypto" },
    { name: "Partners", link: "#partners" },
  ];

  return (
    <header style={{ backgroundColor: "#17142a" }} className="header">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="header__content">
              <button className="header__btn" type="button" aria-label="header__nav">
                <span />
                <span />
                <span />
              </button>

              <a href="/" className="header__logo">
                <img src="img/logo.svg" alt="GrainFi Logo" />
              </a>

              <span className="header__tagline">GRAINFI FARM</span>

              <ul className="header__nav" id="header__nav">
                {navigation.map((item, index) => (
                  <li key={index}>
                    <a
                      href={page === "activity" || page === "admin" ? "/" : `${item.link}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              <div
                id="frame"
                style={{
                  width: "100%",
                  maxWidth: "560px",
                  margin: "8px auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <iframe
                  data-aa="2439349"
                  src="https://acceptable.a-ads.com/2439349/?size=Adaptive"
                  title="A-Ads Banner"
                  style={{
                    width: "100%",
                    maxWidth: "560px",
                    minHeight: "70px",
                    border: "0",
                    padding: "0",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    display: "block",
                  }}
                />
                <a
                  href="https://aads.com/campaigns/new/?source_id=2439349&source_type=ad_unit&partner=2439349"
                  style={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "11px",
                    lineHeight: "1.2",
                    marginTop: "4px",
                  }}
                >
                  Advertise here
                </a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ConnectButton />
                <a
                  data-bs-target="#modal-deposit1"
                  type="button"
                  data-bs-toggle="modal"
                  className="header__profile"
                >
                  <i className="ti ti-user-circle">
                    <MdGeneratingTokens />
                  </i>
                  <span>Get GrainFi</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .header__nav {
              display: none;
            }

            #frame {
              max-width: 320px;
              margin: 6px auto;
            }

            #frame iframe {
              min-height: 60px;
            }

            .header__content {
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }

            .header__profile {
              font-size: 14px;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Header;