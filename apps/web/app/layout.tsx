import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Dhamma Library",
  description: "Open Buddhist Digital Knowledge & Research Platform",
  metadataBase: new URL("https://example.github.io/digital-dhamma-library/")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
