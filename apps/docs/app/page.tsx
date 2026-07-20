import type { Metadata } from "next";
import DokugenHomeClient from "@/components/DokugenHomeClient";
import siteMetadata from "../utils/siteMetaData";

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  alternates: {
    canonical: siteMetadata.siteUrl,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: "Dokugen",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://dokugen.samueltuoyo.com/#website",
      "url": "https://dokugen.samueltuoyo.com",
      "name": "Dokugen",
      "description": siteMetadata.description,
      "publisher": {
        "@id": "https://dokugen.samueltuoyo.com/#organization"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://dokugen.samueltuoyo.com/#organization",
      "name": "Dokugen",
      "url": "https://dokugen.samueltuoyo.com",
      "logo": "https://dokugen.samueltuoyo.com/card.png",
      "sameAs": [
        "https://github.com/sameultuoyo15/Dokugen",
        "https://x.com/TuoyoS26091",
        "https://www.linkedin.com/in/samuel-tuoyo-8568b62b6"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://dokugen.samueltuoyo.com/#software",
      "name": "Dokugen",
      "operatingSystem": "Windows, macOS, Linux",
      "applicationCategory": "DeveloperApplication",
      "description": "Dokugen is an open-source command-line tool and generator that effortlessly generates high-quality README.md files, architecture flowcharts, licenses, and AI commits for your projects.",
      "url": "https://dokugen.samueltuoyo.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://dokugen.samueltuoyo.com/#navigation",
      "name": ["Documentation", "Terms of Service", "Privacy Policy", "GitHub Repository"],
      "url": [
        "https://dokugen.samueltuoyo.com",
        "https://dokugen.samueltuoyo.com/terms",
        "https://dokugen.samueltuoyo.com/privacy",
        "https://github.com/samueltuoyo15/Dokugen"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://dokugen.samueltuoyo.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://dokugen.samueltuoyo.com"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://dokugen.samueltuoyo.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I install Dokugen?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dokugen installs in seconds on any system. For Node.js users, run npm install -g dokugen or pnpm add -g dokugen. For Python, run uv tool install dokugen or pip install dokugen."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use custom templates?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. Stand out from the crowd by matching the layout of your favorite repositories. Simply use the --template flag and provide any public README URL."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI Commit subcommand work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Running dokugen aic stages your files, reads the git diff, and writes Conventional Commits using Gemini, then commits and optionally pushes with one confirmation."
          }
        },
        {
          "@type": "Question",
          "name": "Does Dokugen read my .env files or sensitive API keys?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your trust is our top priority. Dokugen has built-in security filters that strictly ignore sensitive files like .env, credentials, bytecode, and lockfiles. None of your private keys or secrets are ever read or transmitted."
          }
        },
        {
          "@type": "Question",
          "name": "Does Dokugen require my own API keys?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No API keys or payment required to start. We provide a fully managed backend with shared API keys so you can experience Dokugen instantly."
          }
        },
        {
          "@type": "Question",
          "name": "Which languages and frameworks does Dokugen support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dokugen is 100% language and framework agnostic! It supports all types of frameworks and programming languages (Node.js, React, Python, Django, Go, Rust, Java, PHP, C++, and more)."
          }
        },
        {
          "@type": "Question",
          "name": "What is the license generation feature?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Running dokugen license auto-detects git details and generates a compliant LICENSE along with a human-readable summary that builds trust."
          }
        },
        {
          "@type": "Question",
          "name": "How do the colorized flowcharts work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dokugen automatically maps your project's structure and renders clean, color-coded architecture flowcharts inside your README."
          }
        },
        {
          "@type": "Question",
          "name": "What is the smart update command?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Using dokugen update updates the technical directories and dependencies while leaving your carefully written descriptions, tutorials, and badges untouched."
          }
        }
      ]
    }
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DokugenHomeClient />
    </>
  );
}
