import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./portfolio-v2.css";

const title = "Yashwant Bhyri — AI Systems & Application Engineer";
const description =
  "Interactive portfolio of Yashwant Bhyri, a CUHK-Shenzhen Computer Science and AI student building production-grade agent runtimes, multimodal AI applications, retrieval systems, and full-stack AI products.";

export const viewport: Viewport = {
  themeColor: "#050608",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-systems-portfolio-ecru.vercel.app";
const metadataBase = new URL(siteUrl);
const socialImage = new URL(`${basePath}/og.png`, metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  alternates: {
    canonical: `${basePath}/`,
    languages: {
      en: `${basePath}/`,
      "zh-Hans": `${basePath}/zh/`,
    },
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: socialImage, width: 1672, height: 941, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The Chinese portal lives at /zh/; the document language is set there by a
  // small inline script so the CJK font stack and screen readers both agree.
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "if(location.pathname.indexOf('/zh')!==-1){document.documentElement.lang='zh-Hans';}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
