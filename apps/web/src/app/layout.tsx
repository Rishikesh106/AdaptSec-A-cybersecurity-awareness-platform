import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "AdaptSec | Human Risk & Security Awareness Platform",
  description:
    "Enterprise security awareness training, multi-channel attack simulations, and human risk management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink-primary min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
