import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
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
  title: "Lista de Mercado",
  description: "Lista de compras dinâmica",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  const fontScaleCookie = cookieStore.get("font-scale");

  const isDark = themeCookie?.value === "dark";
  const fontScale = fontScaleCookie?.value || "1";

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
      style={{ "--font-scale": fontScale } as React.CSSProperties}
    >
      <body className="min-h-full bg-white dark:bg-zinc-900 font-sans">{children}</body>
    </html>
  );
}
