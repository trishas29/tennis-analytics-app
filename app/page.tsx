import Link from "next/link";

import { fetchMatches } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  let status = "Connected to Supabase";
  let message = 'Successfully queried the "matches" table.';

  try {
    const { data, error } = await fetchMatches();

    if (error) {
      throw error;
    }

    message = `Successfully queried the "matches" table (${data?.length ?? 0} rows).`;
  } catch (error) {
    status = "Supabase connection failed";
    message =
      error instanceof Error ? error.message : "An unknown error occurred.";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Tennis Analytics App
          </h1>
          <p
            className={`text-sm font-medium ${
              status === "Connected to Supabase"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {status}
          </p>
          <p className="text-sm text-neutral-600">{message}</p>
          <div className="pt-2">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              href="/start-match"
            >
              Start Match
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
