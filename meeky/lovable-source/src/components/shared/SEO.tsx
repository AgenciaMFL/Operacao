import { Head } from "vite-react-ssg";

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  preloadImage?: string;
  ogType?: "website" | "article" | "product";
}

/**
 * SSR-safe head injection. Replaces the legacy useSEO hook so meta tags,
 * canonical and robots end up in the prerendered HTML (not just after hydration).
 *
 * Render this once per page, typically as the first child of <Layout>.
 */
const SEO = ({ title, description, ogImage, canonical, noindex, preloadImage, ogType = "website" }: SEOProps) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
    <meta property="og:type" content={ogType} />
    {canonical && <meta property="og:url" content={canonical} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
    {ogImage && <meta name="twitter:image" content={ogImage} />}
    {canonical && <link rel="canonical" href={canonical} />}
    {preloadImage && (
      <link rel="preload" as="image" href={preloadImage} fetchPriority="high" type="image/webp" />
    )}
    {noindex ? (
      <meta name="robots" content="noindex, nofollow" />
    ) : (
      <meta name="robots" content="index, follow" />
    )}
  </Head>
);

export default SEO;

