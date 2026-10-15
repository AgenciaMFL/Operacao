import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Resized variants live in /public alongside the originals. Generated once with sharp/PIL.
// md   = 720px longest side (displayed in the main viewer)
// thumb = 160px (DPR 2 over 80×80 thumbnails)
// Original full-res file is kept as the high-DPI srcset fallback.
type GalleryImage = { src: string; md: string; thumb: string; alt: string };

export const productImages: GalleryImage[] = [
  {
    src: "/hero-product.webp",
    md: "/hero-product-md.webp",
    thumb: "/hero-product-thumb.webp",
    alt: "fone-de-ouvido-bluetooth-meeky-f5-anc-preto-caixa",
  },
  {
    src: "/product/meeky-f5-anc-lifestyle-feminino.webp",
    md: "/product/meeky-f5-anc-lifestyle-feminino-md.webp",
    thumb: "/product/meeky-f5-anc-lifestyle-feminino-thumb.webp",
    alt: "fone-meeky-f5-anc-cancelamento-ruido-lifestyle-feminino",
  },
  {
    src: "/product/meeky-f5-anc-detalhe-conector.webp",
    md: "/product/meeky-f5-anc-detalhe-conector-md.webp",
    thumb: "/product/meeky-f5-anc-detalhe-conector-thumb.webp",
    alt: "detalhe-conector-fone-de-ouvido-meeky-f5-anc",
  },
  {
    src: "/product/meeky-f5-anc-uso-urbano.webp",
    md: "/product/meeky-f5-anc-uso-urbano-md.webp",
    thumb: "/product/meeky-f5-anc-uso-urbano-thumb.webp",
    alt: "fone-bluetooth-meeky-f5-anc-uso-urbano-masculino",
  },
  {
    src: "/product/meeky-f5-anc-perfil-esporte.webp",
    md: "/product/meeky-f5-anc-perfil-esporte-md.webp",
    thumb: "/product/meeky-f5-anc-perfil-esporte-thumb.webp",
    alt: "perfil-masculino-fone-bluetooth-meeky-f5-anc-esporte",
  },
];

const ProductGallery = () => {
  const [active, setActive] = useState(0);
  const total = productImages.length;
  const go = (i: number) => setActive(((i % total) + total) % total);
  const current = productImages[active];

  return (
    <div>
      <div className="relative bg-secondary rounded-sm overflow-hidden aspect-square group">
        <img
          src={current.md}
          srcSet={`${current.md} 720w, ${current.src} 1200w`}
          sizes="(min-width: 768px) 640px, 92vw"
          alt={current.alt}
          width={1200}
          height={1200}
          loading="eager"
          fetchPriority={active === 0 ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="Foto anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="Próxima foto"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 transition-colors backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        {productImages.map((thumb, i) => (
          <button
            key={thumb.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-sm overflow-hidden bg-secondary border transition-colors ${
              active === i ? "border-accent" : "border-border hover:border-foreground/40"
            }`}
          >
            <img
              src={thumb.thumb}
              alt={thumb.alt}
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
