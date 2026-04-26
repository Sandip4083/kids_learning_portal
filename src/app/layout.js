import { Nunito } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClientProviders from "./providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Kids' Learning Portal — Learn, Play & Grow!",
    template: "%s | Kids' Learning Portal",
  },
  description:
    "An AI-powered interactive learning portal for kids featuring adaptive quizzes, science lessons, AI-generated stories, educational games with computer opponents, gamification, and parent dashboard. The smartest way for kids to learn!",
  keywords: [
    "kids learning",
    "educational games",
    "adaptive quiz",
    "AI learning",
    "science for kids",
    "stories for children",
    "interactive learning",
    "parent dashboard",
    "ludo game",
    "math quiz",
  ],
  authors: [{ name: "Sandip" }],
  openGraph: {
    title: "Kids' Learning Portal — AI-Powered Learning for Kids",
    description: "Interactive learning platform with adaptive quizzes, AI stories, games, and parent dashboard.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#6C5CE7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ClientProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
