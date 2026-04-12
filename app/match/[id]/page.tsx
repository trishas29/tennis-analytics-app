import MatchScreen from "./MatchScreen";

type MatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return <MatchScreen matchId={id} />;
}
