import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Digital Dhamma Library",
    template: "%s — Digital Dhamma Library",
  },
  description: "Open Buddhist Digital Knowledge & Research Platform",
  metadataBase: new URL("https://snbhante.github.io/digital-dhamma-library/"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
