import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CTASectionProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  variant?: "dark" | "light";
}

const CTASection = ({ title, subtitle, buttonText, buttonLink, variant = "dark" }: CTASectionProps) => {
  const isDark = variant === "dark";
  return (
    <section className={`${isDark ? "bg-primary" : "bg-secondary"}`}>
      <div className="container-wide section-padding py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 ${isDark ? "text-primary-foreground" : "text-foreground"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-lg mb-10 ${isDark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}
          <Link
            to={buttonLink}
            className={`inline-block px-10 py-4 text-sm font-semibold tracking-wider rounded-sm transition-all hover:scale-105 ${
              isDark
                ? "bg-accent text-accent-foreground hover:bg-gold-light"
                : "bg-primary text-primary-foreground hover:bg-charcoal-light"
            }`}
          >
            {buttonText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
