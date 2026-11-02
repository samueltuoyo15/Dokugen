import { HandHeart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchBox from "./SearchBox";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

/** Logo on the left, search pill and MyHappr support button on the right. */
export default function Navbar({ searchQuery = "", onSearchChange }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between pt-8 gap-4">
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <Image src="/dokugen_logo.svg" alt="Dokugen logo" width={28} height={28} className="object-contain" />
        <span className="text-xl font-extrabold tracking-tight text-zinc-950">Dokugen</span>
      </Link>

      <div className="flex items-center gap-3">
        {onSearchChange && (
          <div className="hidden md:block w-56 lg:w-64">
            <SearchBox value={searchQuery} onChange={onSearchChange} placeholder="Search docs..." />
          </div>
        )}
        <button
          type="button"
          data-myhappr-username="samueltuoyo"
          data-color="#7c3aed"
          data-button-color="#7c3aed"
          data-text="Support Dokugen"
          data-title="Support Dokugen"
          data-theme="light"
          aria-label="Support Dokugen"
          className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 hover:border-violet-300 shrink-0 cursor-pointer"
        >
          <HandHeart className="h-4 w-4 text-violet-600" />
          <span>Support</span>
        </button>
      </div>
    </nav>
  );
}
