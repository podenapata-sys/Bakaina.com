import CategoryRow from "@/components/CategoryRow";
import CategoryShowcase from "@/components/CategoryShowcase";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroGrid from "@/components/HeroGrid";
import OurProducts from "@/components/OurProducts";
import PromoBanner from "@/components/PromoBanner";
import TrendingProducts from "@/components/TrendingProducts";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroGrid />
        <CategoryRow />
        <TrendingProducts />
        <CategoryShowcase />
        <PromoBanner />
        <OurProducts />
      </main>
      <Footer />
    </>
  );
}
