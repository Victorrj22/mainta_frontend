import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import HeaderNav from "./HeaderNav";

export const metadata: Metadata = {
  title: "Mainta | Professional Cleaning & Maintenance",
  description: "Book premium cleaning and maintenance services in California.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo">
                <Image src="/logo.webp" alt="Mainta Logo" width={40} height={40} /> Mainta
              </Link>
              <HeaderNav />
            </div>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
