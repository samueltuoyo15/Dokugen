import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

const linkClass = "text-sm text-zinc-500 transition-colors hover:text-zinc-950";
const headingClass = "mb-1 text-xs font-bold uppercase tracking-widest text-zinc-950";

/** Slim footer: brand and description, link columns, copyright. */
export default function Footer() {
  return (
    <footer className="bg-white py-14">
      <Container>
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="mb-4 flex items-center gap-2.5">
              <Image src="/dokugen_logo.svg" alt="Dokugen logo" width={24} height={24} className="object-contain" />
              <span className="text-lg font-bold text-zinc-950">Dokugen</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Turn your repositories into job-ready portfolio pieces with senior-grade READMEs, architecture flowcharts,
              and spotless Conventional Commits directly from your terminal.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className={headingClass}>Product</h4>
              <Link href="#features" className={linkClass}>
                Features
              </Link>
              <Link
                href="https://github.com/samueltuoyo15/Dokugen/blob/main/CHANGELOG.md"
                target="_blank"
                className={linkClass}
              >
                Changelog
              </Link>
              <Link href="https://github.com/samueltuoyo15/Dokugen" target="_blank" className={linkClass}>
                GitHub
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className={headingClass}>Support</h4>
              <a href="mailto:hello@samueltuoyo.com" className={linkClass}>
                hello@samueltuoyo.com
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className={headingClass}>Legal</h4>
              <Link href="/terms" className={linkClass}>
                Terms of Service
              </Link>
              <Link href="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-zinc-100 pt-6 text-sm text-zinc-400">&copy; 2026 Dokugen. All rights reserved.</p>
      </Container>
    </footer>
  );
}
