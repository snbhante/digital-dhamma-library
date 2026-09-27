import type { Metadata } from "next";
import "./globals.css";
import AppEnhancements from "../components/AppEnhancements";

export const metadata: Metadata = {
  title: {
    default: "Digital Dhamma Library",
    template: "%s — Digital Dhamma Library",
  },
  description: "Open Buddhist Digital Knowledge & Research Platform",
  metadataBase: new URL("https://snbhante.github.io/digital-dhamma-library/"),
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/favicon.svg`,
    shortcut: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/favicon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-192.svg`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><a className="skip-link" href="#main-content">Skip to content</a><AppEnhancements />{children}</body>
    </html>
  );
}
