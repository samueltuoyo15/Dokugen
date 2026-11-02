"use client";

import MetricsSection from "@/components/metricsSection";
import Container from "@/components/home/Container";
import CtaBand from "@/components/home/CtaBand";
import Faq from "@/components/home/Faq";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import GetStarted from "@/components/home/GetStarted";
import Hero from "@/components/home/Hero";
import Highlights from "@/components/home/Highlights";
import HowItHelps from "@/components/home/HowItHelps";
import Navbar from "@/components/home/Navbar";
import SearchResults from "@/components/home/SearchResults";
import { searchableContent } from "@/lib/homeContent";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function DokugenHomeClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: starsCount } = useQuery<number>({
    queryKey: ["githubStars"],
    queryFn: async () => {
      try {
        const res = await fetch("https://api.github.com/repos/samueltuoyo15/Dokugen");
        if (!res.ok) return 0;
        const data = await res.json();
        return data.stargazers_count;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  const query = searchQuery.toLowerCase();
  const results = searchableContent.filter(
    (item) => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query),
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f7f9] font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Container>
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Hero starsCount={starsCount} />
      </Container>

      {searchQuery ? (
        <SearchResults query={searchQuery} items={results} />
      ) : (
        <>
          <HowItHelps />
          <Highlights />
          <GetStarted />
          <Features />
        </>
      )}

      <Container className="pb-24">
        <MetricsSection />
      </Container>

      {!searchQuery && <Faq />}


      <CtaBand starsCount={starsCount} />
      <Footer />
    </div>
  );
}
