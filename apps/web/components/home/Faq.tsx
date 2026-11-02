import { searchableContent } from "@/lib/homeContent";
import { ChevronDown } from "lucide-react";
import Container from "./Container";

const faqs = searchableContent.filter((item) => item.type === "faq");

/** FAQ accordion built on native details elements. */
export default function Faq() {
  return (
    <Container className="pb-24">
      <h2 className="text-4xl font-bold tracking-tight text-zinc-950">Frequently Asked Questions</h2>
      <div className="mt-8 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group rounded-2xl border border-zinc-200 bg-white transition-colors open:border-zinc-300 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none select-none items-center justify-between p-5 text-[15px] font-semibold text-zinc-900">
              {faq.title}
              <ChevronDown className="h-5 w-5 text-zinc-400 transition duration-300 group-open:-rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-zinc-600">{faq.content}</div>
          </details>
        ))}
      </div>
    </Container>
  );
}
