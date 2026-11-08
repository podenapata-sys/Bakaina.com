import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/shop/ProductView";

export const metadata: Metadata = { title: "Product — BAKAINA" };

/** One static page for every product (/product/?id=…); ProductView loads the product in the browser. */
export default function ProductPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <ProductView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
