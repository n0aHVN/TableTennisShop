import { Header } from "@/components/Header";
import { HeroVideo } from "@/components/HeroVideo";
import { FlagshipSection } from "@/components/FlagshipSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroVideo />
        <FlagshipSection />
      </main>
      <Footer />
    </>
  );
}
