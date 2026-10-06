import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logan LeTourneau",
  description: "Logan LeTourneau, a senior at UH Manoa studying entrepreneurship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
