import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { CEOSection } from "@/components/CEOSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { BrandsSection } from "@/components/BrandsSection";
import { LocationsSection } from "@/components/LocationsSection";
import { ClubSection } from "@/components/ClubSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Bela Ferraz Cosméticos | Sua Beleza, Nossa Paixão</title>
        <meta
          name="description"
          content="Na Bela Ferraz você encontra tudo para ficar ainda mais linda. +30 lojas no Rio de Janeiro com as melhores marcas de cosméticos e preços acessíveis."
        />
        <meta property="og:title" content="Bela Ferraz Cosméticos | Sua Beleza, Nossa Paixão" />
        <meta
          property="og:description"
          content="Na Bela Ferraz você encontra tudo para ficar ainda mais linda. +30 lojas no Rio de Janeiro com as melhores marcas de cosméticos."
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <AboutSection />
          <CEOSection />
          <LocationsSection />
          <TestimonialsSection />
          <BrandsSection />
          <ClubSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
