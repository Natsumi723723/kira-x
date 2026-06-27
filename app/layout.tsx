import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kira ✦",
  description: "かわいいをつぶやこう♡",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
