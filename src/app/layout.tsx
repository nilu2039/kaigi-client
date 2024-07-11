import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/context/socket";
import { PlayerProvider } from "@/context/player";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dailogo",
  description: "Talk to strangers anonymously",
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
          <body className={`${inter.className} ${poppins.className}`}>
            {children}
          </body>
        </html>
      </PlayerProvider>
    </SocketProvider>
  );
}
