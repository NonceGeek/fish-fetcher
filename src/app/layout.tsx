import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "钓鱼小游戏",
  description: "一款钓鱼小游戏",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
