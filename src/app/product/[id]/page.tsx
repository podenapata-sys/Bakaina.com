import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/shop/ProductView";
import { getProductForSeo, productJsonLd } from "@/lib/productSeo";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductForSeo(id);
  if (!p) return { title: "Product not found — BAKAINA" };
  const description = (p.seoDescription || p.shortDescription || p.description || "").slice(0, 160);
  return {
    title: `${p.name} — BAKAINA`,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: { title: p.name, description, type: "website", images: p.images?.[0] ? [p.images[0]] : undefined },
  };
}

/** Structured data for Google. Reads the route param, so it renders at request time inside Suspense. */
async function ProductJsonLd({ params }: Props) {
  const { id } = await params;
  const p = await getProductForSeo(id);
  if (!p) return null;
  const json = JSON.stringify(productJsonLd(p, `${siteUrl}/product/${id}`)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export default function ProductPage({ params }: Props) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <ProductView />
        </Suspense>
        <Suspense>
          <ProductJsonLd params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
