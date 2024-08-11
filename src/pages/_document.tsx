import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID
const googleAdsClientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsClientId}`}
        crossorigin='anonymous'
      ></script>
      <script async src='https://us.umami.is/script.js' data-website-id={umamiId} />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
