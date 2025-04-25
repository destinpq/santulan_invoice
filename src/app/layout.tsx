import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoice Tracker - Task Management",
  description: "Track tasks, hours invested, and costs for development work",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice Tracker</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Invoice Tracker. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
