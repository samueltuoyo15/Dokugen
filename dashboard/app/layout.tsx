import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import siteMetadata from "../utils/siteMetaData";
import Providers from "./Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    template: `%s | ${siteMetadata.title}`,
    default: siteMetadata.title, 
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
  },
  other: {
    "google-site-verification": "pcNkCr96GgxHUdk4V5-hzhdy0OH_EcNsvVzTQERObHo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} select-none antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}