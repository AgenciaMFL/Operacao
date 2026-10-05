import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            id="panda-2bed2f41-8690-482c-94cb-9a91c1aa6605"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: '300%', height: '300%', border: 'none' }}
            src="https://player-vz-56a7d893-7bf.tv.pandavideo.com.br/embed/?v=2bed2f41-8690-482c-94cb-9a91c1aa6605&autoplay=1&mute=1&loop=1&controls=0&playsinline=1&startTime=0"
            title="Bela Ferraz Video"
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen"
            allowFullScreen
            // @ts-ignore
            fetchpriority="high"
          />
          <div className="absolute inset-0 z-[1]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide pt-32 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-6"
          >
            Sua beleza,{" "}
            <span className="text-gradient">nossa paixão</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Na Bela Ferraz você encontra tudo para ficar ainda mais linda. 
            As melhores marcas e preços do mercado com atendimento personalizado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <a href={`${import.meta.env.BASE_URL}lojas`}>
                Encontre uma loja
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="https://play.google.com/store/apps/details?id=com.crescevendas.belaferraz&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
                Baixe o App Clube Bela
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.a
        href="#sobre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 flex flex-col items-center gap-2 cursor-pointer"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.a>
    </section>
  );
};
