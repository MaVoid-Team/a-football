import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Football - Your Game, Your Time, Your Court",
  description: "Book premium football courts instantly",
};

// Root layout delegates html/body rendering to [locale]/layout.tsx
// so that lang and dir attributes can be set per locale.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
