import type { Metadata, Viewport } from "next";
import siteMetadata from "../utils/siteMetaData";
import Providers from "./Providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    template: "%s | Dokugen",
    default: siteMetadata.title,
  },
  description: siteMetadata.description,
  alternates: {
    canonical: siteMetadata.siteUrl,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: "Dokugen",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteMetadata.socialBanner,
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.socialBanner],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION_TOKEN || "",
  },
  icons: {
    icon: [{ url: "/dokugen_logo.svg", type: "image/svg+xml" }],
    shortcut: "/dokugen_logo.svg",
    apple: "/dokugen_logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/dokugen_logo.svg" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <script
          src="https://cdn.usemadeby.com/v1/embed.js"
          data-key="mb_live_481be9f586b3f23df7a1924267bd298d7543a25ac78b8ceb"
          data-position="br"
          data-docked="true"
          data-offset="16"
          data-trigger="hover"
          data-appear="now"
          data-phones="always"
          data-palette="plum"
          data-font="geometric"
          data-shape="pill"
          data-size="m"
          data-effect="solid"
          data-border="hair"
          data-shadow="soft"
          data-pattern="rays"
          data-label="Created by"
          data-icon="photo"
          data-emoji="🚀"
          data-layout="list"
          data-app-arrow="diagonal"
          data-icon-colors="brand"
          data-social-colors="badge"
          data-show-bio="true"
          data-show-socials="true"
          data-show-all="true"
          data-footer="true"
          data-face="name"
          data-theme="fixed"
          defer
        />
        <script src="https://myhappr.com/widget.js" defer />
      </body>
    </html>
  );
}
