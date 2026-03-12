import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LanguageGuard from "./LanguageGuard"; // Birazdan oluşturacağımız bekçi

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ali Agent V2.0",
  description: "Acımasız ve Dürüst Finansal Analiz Ajanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Bekçimizi buraya ekledik, tüm siteyi o koruyacak */}
        <LanguageGuard>
          {children}
        </LanguageGuard>
      </body>
    </html>
  );
}