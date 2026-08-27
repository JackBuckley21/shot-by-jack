export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DM_Serif_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Shot By Jack",
  description: "A photography portfolio shot on the Sony a6400.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${workSans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
