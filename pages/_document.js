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

        {/* MONETAG MULTITAG */}
        <script
          src="https://quge5.com/88/tag.min.js"
          data-zone="240546"
          async
          data-cfasync="false"
        ></script>

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}