import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import merge from "lodash/merge";
import "@rainbow-me/rainbowkit/styles.css";
import Script from "next/script";
import MonetagScript from "../Components/MonetagScript";
import Head from "next/head";

import {
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme,
} from "@rainbow-me/rainbowkit";

import { configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const BASE_MAINNET_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || "https://mainnet.base.org";

const EXPLORER =
  process.env.NEXT_PUBLIC_EXPLORER || "https://basescan.org";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);

const CURRENCY =
  process.env.NEXT_PUBLIC_CURRENCY || "ETH";

const DECIMALS = Number(
  process.env.NEXT_PUBLIC_NETWORK_DECIMALS || 18
);

const NAME =
  process.env.NEXT_PUBLIC_NETWORK_NAME || "Base";

const NETWORK =
  process.env.NEXT_PUBLIC_NETWORK || "base";

const baseMainnet = {
  id: CHAIN_ID,
  name: NAME,
  network: NETWORK,
  nativeCurrency: {
    name: NAME,
    symbol: CURRENCY,
    decimals: DECIMALS,
  },
  rpcUrls: {
    default: {
      http: [BASE_MAINNET_RPC_URL],
    },
    public: {
      http: [BASE_MAINNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: EXPLORER,
    },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [baseMainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === CHAIN_ID) {
          return {
            http: BASE_MAINNET_RPC_URL,
          };
        }

        return null;
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "OLYNT",
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

export default function App({ Component, pageProps }) {
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