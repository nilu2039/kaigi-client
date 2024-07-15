import { PlayerProvider } from "@/context/player";
import { SocketProvider } from "@/context/socket";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const comic_neue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketProvider>
      <PlayerProvider>
        <html lang="en">
          <body className={`${comic_neue.variable} ${comic_neue.className}`}>
            {children}
          </body>
        </html>
      </PlayerProvider>
    </SocketProvider>
  );
}
