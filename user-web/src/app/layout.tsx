// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components";

export const metadata: Metadata = {
  title: "Quickzone",
  description: "Made with ❤️ by Techentia",
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (  
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
