"use client";

import { useState } from "react";

import {
  awardPoint,
  createInitialScoreState,
  getPointDisplay,
  type Player,
} from "@/lib/scoreEngine";

type MatchScreenProps = {
  matchId: string;
};

function ScoreCard({
  games,
  label,
  points,
  setScore,
}: {
  games: number;
  label: string;
  points: string;
  setScore: number;
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-neutral-100 px-3 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Set</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{setScore}</p>
        </div>
        <div className="rounded-xl bg-neutral-100 px-3 py-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Games</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{games}</p>
        </div>
        <div className="rounded-xl bg-neutral-900 px-3 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-neutral-300">Points</p>
          <p className="mt-1 text-2xl font-semibold">{points}</p>
        </div>
      </div>
    </article>
  );
}

export default function MatchScreen({ matchId }: MatchScreenProps) {
  const [score, setScore] = useState(createInitialScoreState);

  const pointDisplay = score.inTiebreak
    ? {
        player1: String(score.tiebreakPoints.player1),
        player2: String(score.tiebreakPoints.player2),
      }
    : getPointDisplay(score.currentGame);

  function handleAwardPoint(winner: Player) {
    setScore((currentScore) => awardPoint(currentScore, winner));
  }

  function handleReset() {
    setScore(createInitialScoreState());
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Live Match</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Match Score
          </h1>
          <p className="mt-3 break-all text-sm text-neutral-600">
            Match ID: <span className="font-mono">{matchId}</span>
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {score.inTiebreak
              ? "Tiebreak in progress"
              : score.matchWinner
                ? `${score.matchWinner === "player1" ? "Player 1" : "Player 2"} won the match`
                : "Standard game scoring"}
          </p>
        </header>

        <div className="grid gap-4">
          <ScoreCard
            games={score.games.player1}
            label="Player 1"
            points={pointDisplay.player1}
            setScore={score.sets.player1}
          />
          <ScoreCard
            games={score.games.player2}
            label="Player 2"
            points={pointDisplay.player2}
            setScore={score.sets.player2}
          />
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            <button
              className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white"
              onClick={() => handleAwardPoint("player1")}
              type="button"
            >
              Player 1 Wins Point
            </button>
            <button
              className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white"
              onClick={() => handleAwardPoint("player2")}
              type="button"
            >
              Player 2 Wins Point
            </button>
            <button
              className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-800"
              onClick={handleReset}
              type="button"
            >
              Reset Score
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
