import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dokugen",
  description: "Dokugen Privacy Policy and data collection guidelines for CLI users.",
  alternates: {
    canonical: "https://dokugen.samueltuoyo.com/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
