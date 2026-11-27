import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";

export const metadata: Metadata = {
  title: "AdaptSec — Enterprise Cybersecurity Behavior Change Platform",
  description: "Transform human risk into an active cyber defense layer through realistic multi-channel simulations, adaptive learning, and gamified labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased cyber-grid bg-cyber-bg min-h-screen text-slate-100 flex flex-col font-sans">
        <AppProvider>
          <Navbar />
          <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
