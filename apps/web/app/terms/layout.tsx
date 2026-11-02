import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Dokugen",
  description: "Dokugen Terms of Service and open-source license agreements.",
  alternates: {
    canonical: "https://dokugen.samueltuoyo.com/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
