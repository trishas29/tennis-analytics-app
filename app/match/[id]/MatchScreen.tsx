"use client";

import { useState } from "react";

import { createPoint } from "@/lib/supabaseClient";
import {
  awardPoint,
  createInitialScoreState,
  getPointDisplay,
  type Player,
} from "@/lib/scoreEngine";

import PointInputFlow, {
  type PointData,
  type PointSubmission,
} from "./PointInputFlow";

type MatchScreenProps = {
  matchId: string;
};

type MatchSnapshot = {
  currentServer: Player;
  score: ReturnType<typeof createInitialScoreState>;
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
    <article className="grid grid-cols-[minmax(0,1fr)_56px_56px_64px] items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-700">{label}</p>
      </div>
      <div className="rounded-lg bg-neutral-100 px-2 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wide text-neutral-500">Set</p>
        <p className="mt-0.5 text-lg font-semibold text-neutral-900">{setScore}</p>
      </div>
      <div className="rounded-lg bg-neutral-100 px-2 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wide text-neutral-500">G</p>
        <p className="mt-0.5 text-lg font-semibold text-neutral-900">{games}</p>
      </div>
      <div className="rounded-lg bg-neutral-900 px-2 py-2 text-center text-white">
        <p className="text-[10px] uppercase tracking-wide text-neutral-300">Pts</p>
        <p className="mt-0.5 text-lg font-semibold">{points}</p>
      </div>
    </article>
  );
}

export default function MatchScreen({ matchId }: MatchScreenProps) {
  const [score, setScore] = useState(createInitialScoreState);
  const [currentServer, setCurrentServer] = useState<Player>("player1");
  const [history, setHistory] = useState<MatchSnapshot[]>([]);
  const [isSavingPoint, setIsSavingPoint] = useState(false);

  const pointDisplay = score.inTiebreak
    ? {
        player1: String(score.tiebreakPoints.player1),
        player2: String(score.tiebreakPoints.player2),
      }
    : getPointDisplay(score.currentGame);

  function applyPointLocally(winner: Player) {
    setHistory((currentHistory) => [
      ...currentHistory,
      {
        currentServer,
        score: JSON.parse(JSON.stringify(score)) as ReturnType<
          typeof createInitialScoreState
        >,
      },
    ]);

    const nextScore = awardPoint(score, winner);
    const gameWasWon =
      nextScore.games.player1 !== score.games.player1 ||
      nextScore.games.player2 !== score.games.player2;

    setScore(nextScore);

    if (gameWasWon) {
      setCurrentServer((server) => (server === "player1" ? "player2" : "player1"));
    }
  }

  function buildTrackedPointInsert(pointData: PointData, winner: Player) {
    const totalGames = score.games.player1 + score.games.player2;
    const pointInGame = score.inTiebreak
      ? score.tiebreakPoints.player1 + score.tiebreakPoints.player2 + 1
      : score.currentGame.player1 + score.currentGame.player2 + 1;
    const rallyLength =
      pointData.rallyLength === undefined
        ? undefined
        : pointData.rallyLength === "7+"
          ? 7
          : Number(pointData.rallyLength);
    const endType =
      pointData.firstServeResult === "ace" || pointData.secondServeResult === "ace"
        ? "winner"
        : pointData.secondServeStatus === "fault"
          ? "unforced_error"
          : pointData.returnResult === "winnerForcedError"
            ? "winner_forced_error"
            : pointData.returnResult === "unforcedError"
              ? "unforced_error"
              : undefined;

    return {
      end_type: endType,
      error_type: pointData.errorType?.toLowerCase(),
      first_serve_direction: pointData.firstServeDirection?.toLowerCase(),
      first_serve_in:
        pointData.firstServeStatus === undefined
          ? undefined
          : pointData.firstServeStatus === "in",
      first_serve_result:
        pointData.firstServeStatus === "fault"
          ? "fault"
          : pointData.firstServeResult,
      game_number: totalGames + 1,
      is_tracked: true,
      match_id: matchId,
      point_in_game: pointInGame,
      rally_length: rallyLength,
      second_serve_direction: pointData.secondServeDirection?.toLowerCase(),
      second_serve_in:
        pointData.secondServeStatus === undefined
          ? undefined
          : pointData.secondServeStatus === "in",
      second_serve_result:
        pointData.secondServeStatus === "fault"
          ? "double_fault"
          : pointData.secondServeResult,
      server: currentServer,
      set_number: score.sets.player1 + score.sets.player2 + 1,
      shot_detail: pointData.extraDirection?.toLowerCase(),
      shot_type: pointData.shotType?.toLowerCase(),
      winner,
    };
  }

  async function handleSubmitPoint(submission: PointSubmission) {
    if (isSavingPoint) {
      return;
    }

    setIsSavingPoint(true);

    try {
      if (submission.isTracked) {
        const insertPayload = buildTrackedPointInsert(
          submission.pointData,
          submission.winner,
        );
        const { data, error } = await createPoint(insertPayload);

        if (error) {
          console.error("Failed to save tracked point", error);
        } else {
          console.log("Saved tracked point", data);
        }
      } else {
        const { data, error } = await createPoint({
          is_tracked: false,
          match_id: matchId,
          winner: submission.winner,
        });

        if (error) {
          console.error("Failed to save quick point", error);
        } else {
          console.log("Saved quick point", data);
        }
      }
    } catch (error) {
      console.error("Unexpected point save error", error);
    } finally {
      applyPointLocally(submission.winner);
      setIsSavingPoint(false);
    }
  }

  function handleUndo() {
    if (history.length === 0) {
      return;
    }

    const previousState = history[history.length - 1];
    setHistory((currentHistory) => currentHistory.slice(0, -1));
    setScore(previousState.score);
    setCurrentServer(previousState.currentServer);
  }

  function handleReset() {
    setScore(createInitialScoreState());
    setCurrentServer("player1");
    setHistory([]);
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-4 sm:px-6 sm:py-6">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <div className="sticky top-2 z-10 space-y-2 bg-neutral-50 pb-1">
          <header className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-neutral-900">
                  Live Match
                </h1>
                <p className="truncate text-xs text-neutral-500">
                  <span className="font-mono">{matchId}</span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-neutral-600">
                  Server: {currentServer === "player1" ? "P1" : "P2"}
                </p>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {score.inTiebreak ? "Tiebreak" : score.matchWinner ? "Match complete" : "In progress"}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              {score.inTiebreak
                ? "Tiebreak in progress"
                : score.matchWinner
                  ? `${score.matchWinner === "player1" ? "Player 1" : "Player 2"} won the match`
                  : "Standard game scoring"}
            </p>
          </header>

          <div className="grid gap-2">
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
        </div>

        <PointInputFlow
          currentServer={currentServer}
          isSaving={isSavingPoint}
          onSubmitPoint={handleSubmitPoint}
        />

        <section className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={history.length === 0}
              onClick={handleUndo}
              type="button"
            >
              Undo Last Point
            </button>
            <button
              className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800"
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
