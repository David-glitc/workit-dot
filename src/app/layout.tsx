import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { ToastProvider } from "./Components/ToastProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Workit-Dot",
  description: "Polkadot Work Kit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider attribute="class">
        <body className={`${poppins.variable} font-sans`}>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
