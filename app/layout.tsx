import type { Metadata } from "next";
import "./globals.css";
import RedirectHandler from "./redirect-handler";

export const metadata: Metadata = {
  title: "kira ✦",
  description: "かわいいをつぶやこう♡",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <RedirectHandler />
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
