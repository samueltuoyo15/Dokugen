import { Search } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Sleek pill input with a round search button on the right. */
export default function SearchBox({
  value,
  onChange,
  placeholder = "Search documentation...",
  className = "",
}: SearchBoxProps) {
  return (
    <div
      className={`group flex h-9 w-full items-center rounded-full border border-zinc-200 bg-white pl-3.5 pr-1 transition-colors focus-within:border-zinc-400 hover:border-zinc-300 ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search documentation"
        className="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
        <Search className="h-3 w-3" />
      </span>
    </div>
  );
}
