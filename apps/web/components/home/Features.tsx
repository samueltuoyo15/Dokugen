import { featureCards } from "@/lib/homeContent";
import Container from "./Container";

/** All nine feature cards, flat and bordered. The first one spans the full row. */
export default function Features() {
  return (
    <Container className="pb-24">
      <h2 id="features" className="scroll-mt-8 text-4xl font-bold tracking-tight text-zinc-950">
        Features
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {featureCards.map(({ icon: Icon, title, body }, index) => (
          <div
            key={title}
            className={`rounded-2xl border border-zinc-200 bg-white p-6 ${index === 0 ? "md:col-span-2" : ""}`}
          >
            <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mb-2 text-lg font-bold tracking-tight text-zinc-950">{title}</h3>
            <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
