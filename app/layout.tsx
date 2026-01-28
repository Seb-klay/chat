import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./clientLayout";
import { ThemeProvider } from "./components/contexts/theme-provider";
import { ModelProvider } from "./components/contexts/model-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with your favourite AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* context for colour theme (dark or light) */}
        <ThemeProvider>
          {/* used to update AI model */}
          <ModelProvider>
            {/* used to hide side bar if user not authenticated */}
            <ClientLayout>
              <main className="w-full">{children}</main>
            </ClientLayout>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
