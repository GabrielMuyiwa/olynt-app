import "../styles/globals.css";
import toast, { Toaster } from "react-hot-toast";
import merge from "lodash/merge";
import "@rainbow-me/rainbowkit/styles.css";
import Script from "next/script";
import MonetagScript from "../Components/MonetagScript";
import InPagePush from "../Components/InPagePush";
import Head from "next/head";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const BASE_SEPOLIA = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
const EXPLORER = process.env.NEXT_PUBLIC_EXPLORER;

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;
const DECIMALS = process.env.NEXT_PUBLIC_NETWORK_DECIMALS;
const NAME = process.env.NEXT_PUBLIC_NETWORK_NAME;
const NETWORK = process.env.NEXT_PUBLIC_NETWORK;

export default function App({ Component, pageProps }) {
  const { chains, provider } = configureChains(
    [
      {
        id: Number(CHAIN_ID),
        name: NAME,
        network: NETWORK,
        nativeCurrency: {
          name: NAME,
          symbol: CURRENCY,
          decimals: Number(DECIMALS),
        },
        rpcUrls: {
          default: {
            http: [`${BASE_SEPOLIA}`],
          },
          public: {
            http: [`${BASE_SEPOLIA}`],
          },
        },
        blockExplorers: {
          default: {
            name: "Base Sepolia Explorer",
            url: EXPLORER,
          },
        },
        testnet: true,
      },
    ],
    [
      jsonRpcProvider({
        rpc: (chain) => {
          if (chain.id === Number(CHAIN_ID)) {
            return { http: `${BASE_SEPOLIA}` };
          }
          return null;
        },
        priority: 1,
      }),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: "StakingDapp",
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const myTheme = merge(midnightTheme(), {
    colors: {
      accentColor: "#562C7B",
      accentColorForeground: "#fff",
    },
  });

  return (
    <>
      <Head>
        <meta
          name="6a97888e-site-verification"
          content="4235aa6c981d9c60d674b7383a2cf118"
        />
      </Head>

      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={myTheme}>
          <MonetagScript />
          <Component {...pageProps} />
          <Toaster />
        </RainbowKitProvider>
      </WagmiConfig>

      <Script src="/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/js/smooth-scrollbar.js" strategy="afterInteractive" />
      <Script src="/js/splide.min.js" strategy="afterInteractive" />
      <Script src="/js/three.min.js" strategy="afterInteractive" />
      <Script src="/js/vanta.fog.min.js" strategy="afterInteractive" />
      <Script src="/js/main.js" strategy="afterInteractive" />
    </>
  );
}