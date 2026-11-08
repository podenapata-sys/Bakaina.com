import type { Metadata } from "next";
import { Noto_Sans_Bengali, Poppins } from "next/font/google";
import { CatalogProvider } from "@/context/CatalogContext";
import { StoreProvider } from "@/context/StoreContext";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BAKAINA — Trending Products Online",
  description: "Global products, trusted quality. Trending products delivered across Bangladesh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${bengali.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CatalogProvider>
          <StoreProvider>{children}</StoreProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
