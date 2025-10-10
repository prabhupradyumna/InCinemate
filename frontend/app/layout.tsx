import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { AuthProvider } from "@/components/customer/auth-provider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ScreenLease - Premium Movie Ticketing",
  description:
    "Book your movie tickets with ScreenLease - The ultimate cinematic experience",
  generator: "ScreenLease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        {/* PhonePe Checkout Script */}
        <script
          src="https://mercury.phonepe.com/web/bundle/checkout.js"
          async
        ></script>
      </body>
    </html>
  );
}
