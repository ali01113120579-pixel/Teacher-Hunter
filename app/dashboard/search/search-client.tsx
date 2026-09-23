"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import type { Lead } from "@/types/lead";

const SERVICES = [
  "Graphic Design",
  "Social Media Design",
  "Thumbnails",
  "Video Editing",
  "Motion Graphics",
  "Branding",
  "Web Design",
];

const NICHES = [
  "Teachers",
  "Doctors",
  "Restaurants",
  "Real Estate",
  "E-commerce",
  "Clothing Brands",
  "Coaches",
  "YouTubers",
  "Podcasters",
  "Gyms",
  "Agencies",
  "Startups",
];

const LOADING_STEPS = [
  "Searching YouTube...",
  "Finding relevant creators and businesses...",
  "Checking public contact information...",
  "Calculating client opportunity scores...",
];

export function SearchClient() {
  const router = useRouter();
  const [service, setService] = useState("Graphic Design");
  const [niche, setNiche] = useState("Teachers");
  const [country, setCountry] = useState("Egypt");
  const [query, setQuery] = useState("");
  const [minSubscribers, setMinSubscribers] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const finalQuery = query.trim() || `${niche} ${country}`;
    setLoading(true);
    setError(null);
    setResults(null);
    setStepIndex(0);
    const interval = setInterval(() => setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1)), 1800);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          filters: {
            service,
            niche,
            country,
            ...(minSubscribers ? { minSubscribers: Number(minSubscribers) } : {}),
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults(data.results as Lead[]);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Find Clients</h1>
        <p className="text-sm text-muted-foreground">Choose what you sell and who you want to work with.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Service</span>
            <select value={service} onChange={(e) => setService(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3">
              {SERVICES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Niche</span>
            <select value={niche} onChange={(e) => setNiche(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3">
              {NICHES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Country</span>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Egypt" />
          </label>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Optional: Cairo restaurants, Egyptian math teachers..."
            className="pl-9"
            dir="auto"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="number"
            min={0}
            value={minSubscribers}
            onChange={(e) => setMinSubscribers(e.target.value)}
            placeholder="Minimum subscribers (optional)"
            className="sm:max-w-xs"
          />
          <Button type="submit" disabled={loading} className="sm:ml-auto">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
            Find Clients
          </Button>
        </div>
      </form>

      {loading && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            {LOADING_STEPS[stepIndex]}
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {results && !loading && results.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">No good client leads found.</p>
            Try a broader niche, remove the subscriber filter, or use a custom search query.
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{results.length} potential clients found, ranked by opportunity.</p>
          <LeadsTable leads={results} />
          <div className="flex flex-col gap-3 md:hidden">
            {results.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        </div>
      )}
    </div>
  );
}
