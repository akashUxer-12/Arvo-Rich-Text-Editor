import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arvo Rich Editor",
  description: "Interactive Arvo Rich Editor playground, examples, and documentation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
