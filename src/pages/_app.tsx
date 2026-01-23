import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { StickyBanner } from "@/components/StickyBanner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <StickyBanner />
      <div className="pt-12">
        <Component {...pageProps} />
      </div>
    </>
  );
}
