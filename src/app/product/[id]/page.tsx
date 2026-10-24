import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/shop/ProductView";

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
