import type { Metadata } from "next";
import { Epilogue, Urbanist } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles.css";

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

export const metadata: Metadata = {
  title: {
    default: "ACI Avionics | B2B Travel Portal",
    template: "%s | ACI Air",
  },
  description: "B2B travel booking portal for flights and hotels",
  authors: [{ name: "ACI Avionics" }],
  openGraph: {
    title: "ACI Avionics | B2B Travel Portal",
    description: "B2B travel booking portal for flights and hotels",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/logo1.png", shortcut: "/logo1.png", apple: "/logo1.png" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} ${epilogue.variable}`}>{children}</body>
    </html>
  );
}
