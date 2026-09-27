import type { Metadata } from "next";
import "./globals.css";
import AppEnhancements from "../components/AppEnhancements";

export const metadata: Metadata = {
  title: {
    default: "Digital Dhamma Library",
    template: "%s — Digital Dhamma Library",
  },
  applicationName: "Digital Dhamma Library",
  description: "Open Buddhist Digital Knowledge & Research Platform",
  metadataBase: new URL("https://snbhante.github.io/digital-dhamma-library/"),
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/favicon.ico`, sizes: "32x32", type: "image/x-icon" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-48.png`, sizes: "48x48", type: "image/png" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    shortcut: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-48.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/branding/icon-180.png`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><a className="skip-link" href="#main-content">Skip to content</a><AppEnhancements />{children}</body>
    </html>
  );
}
