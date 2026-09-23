"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search/?q=${encodeURIComponent(value)}` : "/search/");
  }

  return (
    <form className="search-form" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor="global-search">Search the Dhamma Library</label>
      <input
        id="global-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Pāḷi, English, বাংলা, titles…"
        autoComplete="off"
      />
      <button className="button primary" type="submit">Search</button>
      <Link className="button" href="/search/">Advanced search</Link>
    </form>
  );
}
