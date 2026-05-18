import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>

        {/* MONETAG VERIFICATION */}
        <meta
          name="monetag"
          content="b78d775e910c928e5216baa1b10d6235"
        />

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}