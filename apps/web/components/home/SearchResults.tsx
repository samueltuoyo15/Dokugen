import type { SearchItem } from "@/lib/homeContent";
import Container from "./Container";

interface SearchResultsProps {
  query: string;
  items: SearchItem[];
}

/** Matches for the search box, shown in place of the marketing sections. */
export default function SearchResults({ query, items }: SearchResultsProps) {
  return (
    <Container className="pb-24">
      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950">Search Results</h2>
      <div className="mt-6 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{item.content}</p>
            </div>
          ))
        ) : (
          <p className="py-8 text-center italic text-zinc-400">No results found matching "{query}".</p>
        )}
      </div>
    </Container>
  );
}
