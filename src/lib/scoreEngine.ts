export type Player = "player1" | "player2";

export type PointDisplay = "0" | "15" | "30" | "40" | "A";

export type ScoreState = {
  currentGame: {
    player1: number;
    player2: number;
  };
  games: {
    player1: number;
    player2: number;
  };
  sets: {
    player1: number;
    player2: number;
  };
  inTiebreak: boolean;
  tiebreakPoints: {
    player1: number;
    player2: number;
  };
  matchWinner: Player | null;
};

const POINT_LABELS: PointDisplay[] = ["0", "15", "30", "40"];

export function resetPoints() {
  return {
    player1: 0,
    player2: 0,
  };
}

export function createInitialScoreState(): ScoreState {
  return {
    currentGame: resetPoints(),
    games: resetPoints(),
    sets: resetPoints(),
    inTiebreak: false,
    tiebreakPoints: resetPoints(),
    matchWinner: null,
  };
}

function getOpponent(player: Player): Player {
  return player === "player1" ? "player2" : "player1";
}

export function getPointDisplay(
  points: ScoreState["currentGame"],
): Record<Player, PointDisplay> {
  if (points.player1 >= 3 && points.player2 >= 3) {
    if (points.player1 === points.player2) {
      return {
        player1: "40",
        player2: "40",
      };
    }

    if (points.player1 > points.player2) {
      return {
        player1: "A",
        player2: "40",
      };
    }

    return {
      player1: "40",
      player2: "A",
    };
  }

  return {
    player1: POINT_LABELS[points.player1] ?? "40",
    player2: POINT_LABELS[points.player2] ?? "40",
  };
}

export function isGameWon(state: ScoreState): Player | null {
  if (state.inTiebreak) {
    const player1Won =
      state.tiebreakPoints.player1 >= 7 &&
      state.tiebreakPoints.player1 - state.tiebreakPoints.player2 >= 2;
    const player2Won =
      state.tiebreakPoints.player2 >= 7 &&
      state.tiebreakPoints.player2 - state.tiebreakPoints.player1 >= 2;

    if (player1Won) {
      return "player1";
    }

    if (player2Won) {
      return "player2";
    }

    return null;
  }

  const player1Won =
    state.currentGame.player1 >= 4 &&
    state.currentGame.player1 - state.currentGame.player2 >= 2;
  const player2Won =
    state.currentGame.player2 >= 4 &&
    state.currentGame.player2 - state.currentGame.player1 >= 2;

  if (player1Won) {
    return "player1";
  }

  if (player2Won) {
    return "player2";
  }

  return null;
}

export function isSetWon(state: ScoreState): Player | null {
  const player1Won =
    state.games.player1 >= 6 &&
    state.games.player1 - state.games.player2 >= 2;
  const player2Won =
    state.games.player2 >= 6 &&
    state.games.player2 - state.games.player1 >= 2;

  if (player1Won) {
    return "player1";
  }

  if (player2Won) {
    return "player2";
  }

  if (state.games.player1 === 7 && state.games.player2 === 6) {
    return "player1";
  }

  if (state.games.player2 === 7 && state.games.player1 === 6) {
    return "player2";
  }

  return null;
}

export function awardPoint(state: ScoreState, winner: Player): ScoreState {
  if (state.matchWinner) {
    return state;
  }

  const nextState: ScoreState = {
    ...state,
    currentGame: { ...state.currentGame },
    games: { ...state.games },
    sets: { ...state.sets },
    tiebreakPoints: { ...state.tiebreakPoints },
  };

  if (nextState.inTiebreak) {
    nextState.tiebreakPoints[winner] += 1;
  } else {
    nextState.currentGame[winner] += 1;
  }

  const gameWinner = isGameWon(nextState);

  if (!gameWinner) {
    return nextState;
  }

  nextState.games[gameWinner] += 1;
  nextState.currentGame = resetPoints();

  if (nextState.inTiebreak) {
    nextState.tiebreakPoints = resetPoints();
    nextState.inTiebreak = false;
  }

  const setWinner = isSetWon(nextState);

  if (setWinner) {
    nextState.sets[setWinner] += 1;
    nextState.matchWinner = setWinner;

    return nextState;
  }

  const opponent = getOpponent(gameWinner);

  if (
    nextState.games[gameWinner] === 6 &&
    nextState.games[opponent] === 6 &&
    nextState.sets.player1 === 0 &&
    nextState.sets.player2 === 0
  ) {
    nextState.inTiebreak = true;
    nextState.tiebreakPoints = resetPoints();
  }

  return nextState;
}

function describeState(state: ScoreState) {
  return {
    games: `${state.games.player1}-${state.games.player2}`,
    inTiebreak: state.inTiebreak,
    matchWinner: state.matchWinner,
    points: state.inTiebreak
      ? `${state.tiebreakPoints.player1}-${state.tiebreakPoints.player2}`
      : getPointDisplay(state.currentGame),
    sets: `${state.sets.player1}-${state.sets.player2}`,
  };
}

export function runScoreEngineDemo() {
  const logs: string[] = [];

  let standardGame = createInitialScoreState();
  standardGame = awardPoint(standardGame, "player1");
  standardGame = awardPoint(standardGame, "player1");
  standardGame = awardPoint(standardGame, "player1");
  standardGame = awardPoint(standardGame, "player1");
  logs.push(
    `Standard game: ${JSON.stringify(describeState(standardGame))}`,
  );

  let deuceGame = createInitialScoreState();
  const deuceSequence: Player[] = [
    "player1",
    "player1",
    "player1",
    "player2",
    "player2",
    "player2",
    "player1",
    "player2",
    "player2",
    "player2",
  ];

  for (const pointWinner of deuceSequence) {
    deuceGame = awardPoint(deuceGame, pointWinner);
  }

  logs.push(`Deuce game: ${JSON.stringify(describeState(deuceGame))}`);

  let tiebreakSet = createInitialScoreState();
  tiebreakSet.games = {
    player1: 6,
    player2: 6,
  };
  tiebreakSet.inTiebreak = true;

  const tiebreakSequence: Player[] = [
    "player1",
    "player2",
    "player1",
    "player2",
    "player1",
    "player2",
    "player1",
    "player2",
    "player1",
    "player1",
    "player1",
  ];

  for (const pointWinner of tiebreakSequence) {
    tiebreakSet = awardPoint(tiebreakSet, pointWinner);
  }

  logs.push(`Tiebreak set: ${JSON.stringify(describeState(tiebreakSet))}`);

  for (const log of logs) {
    console.log(log);
  }

  return logs;
}

if (process.env.RUN_SCORE_ENGINE_DEMO === "true") {
  runScoreEngineDemo();
}
