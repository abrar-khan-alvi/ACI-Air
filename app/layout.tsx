import type { Metadata, Viewport } from "next";
import { Epilogue, Urbanist } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-epilogue",
  display: "swap",
});

const description = "Premium flights, stays and travel services from ACI Air.";

export const metadata: Metadata = {
  title: {
    default: "ACI Air",
    template: "%s",
  },
  description,
  authors: [{ name: "ACI Air" }],
  openGraph: {
    title: "ACI Air",
    description,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${epilogue.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
