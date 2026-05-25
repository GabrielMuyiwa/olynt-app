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

        {/* Clickadu verification meta */}
        <meta
          name="clckd"
          content="3ab2b4c005d46eeda2225885fd6f297c"
        />
        
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}