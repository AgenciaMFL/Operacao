interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

/**
 * Static section heading. Previously used framer-motion `whileInView` for a
 * fade-up effect; replaced with Tailwind `animate-fade-in` to remove the
 * motion runtime cost (TBT) on every page that renders headings.
 */
const SectionHeading = ({ eyebrow, title, description, align = "center", light = false }: SectionHeadingProps) => {
  return (
    <div
      className={`mb-12 md:mb-16 animate-fade-in ${align === "center" ? "text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span className={`font-display text-xs font-semibold tracking-[0.25em] uppercase block mb-4 ${light ? "text-accent" : "text-accent"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${light ? "text-primary-foreground" : "text-foreground"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base md:text-lg max-w-2xl leading-relaxed ${align === "center" ? "mx-auto" : ""} ${light ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
