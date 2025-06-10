import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WallCrawler Demo",
  description: "Demo Next.js application showcasing WallCrawler browser automation capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}