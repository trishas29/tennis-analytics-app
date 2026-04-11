import Link from "next/link";

import { startMatch } from "./actions";

type StartMatchPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function StartMatchPage({
  searchParams,
}: StartMatchPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Create Match</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Start Match
          </h1>
          <p className="text-sm text-neutral-600">
            Enter the players and choose who serves first.
          </p>
        </div>

        <form action={startMatch} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-neutral-800"
              htmlFor="player1_name"
            >
              Player 1 name
            </label>
            <input
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none ring-0 placeholder:text-neutral-400"
              id="player1_name"
              name="player1_name"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-neutral-800"
              htmlFor="player2_name"
            >
              Player 2 name
            </label>
            <input
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none ring-0 placeholder:text-neutral-400"
              id="player2_name"
              name="player2_name"
              type="text"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-neutral-800">
              Who serves first?
            </legend>
            <div className="flex gap-3">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-800">
                <input
                  defaultChecked
                  name="first_server"
                  type="radio"
                  value="player1"
                />
                Player 1
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-800">
                <input name="first_server" type="radio" value="player2" />
                Player 2
              </label>
            </div>
          </fieldset>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Start Match
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800"
              href="/"
            >
              Back
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
