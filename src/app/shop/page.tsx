import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShopView from "@/components/shop/ShopView";

export const metadata: Metadata = { title: "Shop all products — BAKAINA" };

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <ShopView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
