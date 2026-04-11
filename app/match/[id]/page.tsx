type MatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">Match</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          Match Started
        </h1>
        <p className="mt-4 text-sm text-neutral-600">Match ID</p>
        <p className="mt-1 break-all font-mono text-sm text-neutral-900">{id}</p>
      </section>
    </main>
  );
}
