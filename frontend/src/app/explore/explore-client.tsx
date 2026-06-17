"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface ExploreClientProps {
  sort: string;
  tag: string | undefined;
  search: string | undefined;
  allTags: string[];
}

export function ExploreClient({ sort, tag, search, allTags }: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(search || "");

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Explore</h1>
        <div className="flex gap-1 text-sm">
          {[
            { key: "latest", label: "Latest" },
            { key: "popular", label: "Popular" },
            { key: "most_viewed", label: "Most Viewed" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => updateParams("sort", s.key)}
              className={`px-3 py-1 rounded-md transition-colors ${
                sort === s.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams("search", searchInput || null);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search conversations..."
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-foreground text-background rounded-md hover:opacity-90"
        >
          Search
        </button>
      </form>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => updateParams("tag", null)}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              !tag
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => updateParams("tag", t === tag ? null : t)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                t === tag
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
