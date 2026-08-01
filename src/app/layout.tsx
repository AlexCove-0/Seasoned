import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sazón",
  description: "Your personal chef instructor.",
  // Added to Home Screen on iOS, this opens without Safari's chrome.
  appleWebApp: { capable: true, title: "Sazón", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // Matches the app ground in both schemes so the iOS status bar and Android
  // chrome blend into the page instead of banding against it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#16140f" },
  ],
  // Stops iOS zooming the page when a text field is focused mid-cook.
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Deliberately a block, not a flex column: `main` uses mx-auto, and
          auto cross-axis margins stop a flex item from stretching, which
          sized every page to its content instead of the viewport. Pages
          carry their own min-h-screen. */}
      <body className="min-h-full">{children}</body>
    </html>
  );
}
