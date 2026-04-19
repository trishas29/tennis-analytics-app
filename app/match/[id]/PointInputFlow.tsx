"use client";

import { useEffect, useRef, useState } from "react";

import type { Player } from "@/lib/scoreEngine";

type PointStep =
  | "firstServeStatus"
  | "firstServeDirection"
  | "firstServeResult"
  | "firstServeMiss"
  | "secondServeStatus"
  | "secondServeDirection"
  | "secondServeResult"
  | "secondServeMiss"
  | "return"
  | "rally"
  | "outcome";
type ServeDirection = "Wide" | "Body" | "T";
type ServeStatus = "in" | "fault";
type ServeResult = "ace" | "returned";
type ReturnResult = "inPlay" | "winnerForcedError" | "unforcedError";
type RallyLength = "3" | "4" | "5" | "6" | "7+";
type ShotType = "Serve" | "Forehand" | "Backhand" | "Volley" | "Smash";
type ExtraDirection =
  | "Cross-court"
  | "Down the line"
  | "Inside out"
  | "Inside In"
  | "Drop shot"
  | "Slice"
  | "Passing shot";
type MissType = "Net" | "Long" | "Wide";

export type PointData = {
  errorType?: MissType;
  extraDirection?: ExtraDirection;
  firstServeDirection?: ServeDirection;
  firstServeMiss?: MissType;
  firstServeResult?: ServeResult;
  firstServeStatus?: ServeStatus;
  rallyLength?: RallyLength;
  returnResult?: ReturnResult;
  secondServeDirection?: ServeDirection;
  secondServeMiss?: MissType;
  secondServeResult?: ServeResult;
  secondServeStatus?: ServeStatus;
  shotType?: ShotType;
  winner?: Player;
};

export type PointSubmission =
  | {
      isTracked: false;
      winner: Player;
    }
  | {
      isTracked: true;
      pointData: PointData;
      winner: Player;
    };

type PointInputFlowProps = {
  currentServer: Player;
  isSaving: boolean;
  onSubmitPoint: (submission: PointSubmission) => Promise<void>;
};

const EXTRA_DIRECTIONS: ExtraDirection[] = [
  "Cross-court",
  "Down the line",
  "Inside out",
  "Inside In",
  "Drop shot",
  "Slice",
  "Passing shot",
];

const SHOT_TYPES: ShotType[] = [
  "Serve",
  "Forehand",
  "Backhand",
  "Volley",
  "Smash",
];

function createInitialPointData(): PointData {
  return {};
}

function getOpponent(player: Player): Player {
  return player === "player1" ? "player2" : "player1";
}

function getStepLabel(step: PointStep) {
  switch (step) {
    case "firstServeStatus":
      return "Step 1: First Serve";
    case "firstServeDirection":
      return "Step 2: First Serve Direction";
    case "firstServeResult":
      return "Step 3: First Serve Result";
    case "firstServeMiss":
      return "Step 3: First Serve Miss";
    case "secondServeStatus":
      return "Step 4: Second Serve";
    case "secondServeDirection":
      return "Step 5: Second Serve Direction";
    case "secondServeResult":
      return "Step 6: Second Serve Result";
    case "secondServeMiss":
      return "Step 6: Second Serve Miss";
    case "return":
      return "Step 7: Return";
    case "rally":
      return "Step 8: Rally";
    case "outcome":
      return "Step 9: Outcome";
  }
}

function getSelectionClass(isSelected: boolean) {
  return isSelected
    ? "border-neutral-900 bg-neutral-900 text-white"
    : "border-neutral-300 bg-white text-neutral-900";
}

function SelectionButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${getSelectionClass(isSelected)}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}

function inferWinner(pointData: PointData, currentServer: Player): Player | null {
  const returner = getOpponent(currentServer);

  if (pointData.firstServeResult === "ace" || pointData.secondServeResult === "ace") {
    return currentServer;
  }

  if (pointData.secondServeStatus === "fault") {
    return returner;
  }

  if (
    pointData.returnResult === "winnerForcedError" ||
    pointData.returnResult === "unforcedError"
  ) {
    return currentServer;
  }

  if (pointData.returnResult === "inPlay") {
    if (pointData.rallyLength === "7+") {
      return pointData.winner ?? null;
    }

    if (pointData.rallyLength) {
      return Number(pointData.rallyLength) % 2 === 0 ? "player2" : "player1";
    }
  }

  return pointData.winner ?? null;
}

export default function PointInputFlow({
  currentServer,
  isSaving,
  onSubmitPoint,
}: PointInputFlowProps) {
  const [currentStep, setCurrentStep] = useState<PointStep>("firstServeStatus");
  const [pointData, setPointData] = useState<PointData>(createInitialPointData);
  const containerRef = useRef<HTMLElement | null>(null);

  const inferredWinner = inferWinner(pointData, currentServer);
  const returner = getOpponent(currentServer);

  useEffect(() => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [currentStep]);

  function resetPointFlow() {
    setCurrentStep("firstServeStatus");
    setPointData(createInitialPointData());
  }

  async function handleQuickAddPoint(winner: Player) {
    await onSubmitPoint({
      isTracked: false,
      winner,
    });
    resetPointFlow();
  }

  function handleFirstServeStatus(status: ServeStatus) {
    setPointData({
      firstServeStatus: status,
    });
    setCurrentStep("firstServeDirection");
  }

  function handleFirstServeDirection(direction: ServeDirection) {
    setPointData((currentData) => ({
      ...currentData,
      firstServeDirection: direction,
    }));
    setCurrentStep(
      pointData.firstServeStatus === "fault"
        ? "firstServeMiss"
        : "firstServeResult",
    );
  }

  function handleFirstServeResult(result: ServeResult) {
    setPointData((currentData) => ({
      ...currentData,
      firstServeResult: result,
      shotType: result === "ace" ? "Serve" : currentData.shotType,
    }));
    setCurrentStep(result === "ace" ? "outcome" : "return");
  }

  function handleFirstServeMiss(miss: MissType) {
    setPointData((currentData) => ({
      ...currentData,
      firstServeMiss: miss,
    }));
    setCurrentStep("secondServeStatus");
  }

  function handleSecondServeStatus(status: ServeStatus) {
    setPointData((currentData) => ({
      ...currentData,
      secondServeStatus: status,
    }));
    setCurrentStep("secondServeDirection");
  }

  function handleSecondServeDirection(direction: ServeDirection) {
    setPointData((currentData) => ({
      ...currentData,
      secondServeDirection: direction,
      shotType: currentData.secondServeStatus === "fault" ? "Serve" : currentData.shotType,
    }));
    setCurrentStep(
      pointData.secondServeStatus === "fault"
        ? "secondServeMiss"
        : "secondServeResult",
    );
  }

  function handleSecondServeResult(result: ServeResult) {
    setPointData((currentData) => ({
      ...currentData,
      secondServeResult: result,
      shotType: result === "ace" ? "Serve" : currentData.shotType,
    }));
    setCurrentStep(result === "ace" ? "outcome" : "return");
  }

  function handleSecondServeMiss(miss: MissType) {
    setPointData((currentData) => ({
      ...currentData,
      errorType: miss,
      secondServeMiss: miss,
      shotType: "Serve",
    }));
    setCurrentStep("outcome");
  }

  function handleReturnResult(result: ReturnResult) {
    setPointData((currentData) => ({
      ...currentData,
      errorType: result === "unforcedError" ? currentData.errorType : undefined,
      returnResult: result,
      winner: undefined,
    }));
    setCurrentStep(result === "inPlay" ? "rally" : "outcome");
  }

  function handleRallyLength(length: RallyLength) {
    setPointData((currentData) => ({
      ...currentData,
      rallyLength: length,
      winner: length === "7+" ? currentData.winner : undefined,
    }));
    setCurrentStep("outcome");
  }

  async function handleConfirmPoint() {
    const winner = inferredWinner;

    if (!winner) {
      return;
    }

    await onSubmitPoint({
      isTracked: true,
      pointData,
      winner,
    });
    resetPointFlow();
  }

  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
      ref={containerRef}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">Point Input</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
            {getStepLabel(currentStep)}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Server: {currentServer === "player1" ? "Player 1" : "Player 2"} | Returner:{" "}
            {returner === "player1" ? "Player 1" : "Player 2"}
          </p>
        </div>
        <button
          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          onClick={resetPointFlow}
          type="button"
        >
          Reset Point
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SummaryItem
          label="First Serve"
          value={
            pointData.firstServeStatus === "fault"
              ? `Fault${pointData.firstServeDirection ? ` • ${pointData.firstServeDirection}` : ""}${pointData.firstServeMiss ? ` • ${pointData.firstServeMiss}` : ""}`
              : pointData.firstServeResult === "ace"
                ? `Ace${pointData.firstServeDirection ? ` • ${pointData.firstServeDirection}` : ""}`
                : pointData.firstServeResult === "returned"
                  ? `Returned${pointData.firstServeDirection ? ` • ${pointData.firstServeDirection}` : ""}`
                  : "Waiting"
          }
        />
        <SummaryItem
          label="Second Serve"
          value={
            pointData.secondServeStatus === "fault"
              ? `Fault${pointData.secondServeDirection ? ` • ${pointData.secondServeDirection}` : ""}${pointData.secondServeMiss ? ` • ${pointData.secondServeMiss}` : ""}`
              : pointData.secondServeResult === "ace"
                ? `Ace${pointData.secondServeDirection ? ` • ${pointData.secondServeDirection}` : ""}`
                : pointData.secondServeResult === "returned"
                  ? `Returned${pointData.secondServeDirection ? ` • ${pointData.secondServeDirection}` : ""}`
                  : "Waiting"
          }
        />
        <SummaryItem
          label="Return"
          value={
            pointData.returnResult === "winnerForcedError"
              ? "Winner/forced error"
              : pointData.returnResult ?? "Waiting"
          }
        />
        <SummaryItem
          label="Winner"
          value={
            inferredWinner
              ? inferredWinner === "player1"
                ? "Player 1 (auto)"
                : "Player 2 (auto)"
              : "Waiting"
          }
        />
      </div>

      {currentStep === "firstServeStatus" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SelectionButton
            isSelected={pointData.firstServeStatus === "in"}
            label="In"
            onClick={() => handleFirstServeStatus("in")}
          />
          <SelectionButton
            isSelected={pointData.firstServeStatus === "fault"}
            label="Fault"
            onClick={() => handleFirstServeStatus("fault")}
          />
        </div>
      ) : null}

      {currentStep === "firstServeDirection" ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {(["Wide", "Body", "T"] as ServeDirection[]).map((direction) => (
            <SelectionButton
              isSelected={pointData.firstServeDirection === direction}
              key={direction}
              label={direction}
              onClick={() => handleFirstServeDirection(direction)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === "firstServeResult" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SelectionButton
            isSelected={pointData.firstServeResult === "ace"}
            label="Ace"
            onClick={() => handleFirstServeResult("ace")}
          />
          <SelectionButton
            isSelected={pointData.firstServeResult === "returned"}
            label="Returned"
            onClick={() => handleFirstServeResult("returned")}
          />
        </div>
      ) : null}

      {currentStep === "firstServeMiss" ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {(["Long", "Wide", "Net"] as MissType[]).map((miss) => (
            <SelectionButton
              isSelected={pointData.firstServeMiss === miss}
              key={miss}
              label={miss}
              onClick={() => handleFirstServeMiss(miss)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === "secondServeStatus" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SelectionButton
            isSelected={pointData.secondServeStatus === "in"}
            label="In"
            onClick={() => handleSecondServeStatus("in")}
          />
          <SelectionButton
            isSelected={pointData.secondServeStatus === "fault"}
            label="Fault"
            onClick={() => handleSecondServeStatus("fault")}
          />
        </div>
      ) : null}

      {currentStep === "secondServeDirection" ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {(["Wide", "Body", "T"] as ServeDirection[]).map((direction) => (
            <SelectionButton
              isSelected={pointData.secondServeDirection === direction}
              key={direction}
              label={direction}
              onClick={() => handleSecondServeDirection(direction)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === "secondServeResult" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SelectionButton
            isSelected={pointData.secondServeResult === "ace"}
            label="Ace"
            onClick={() => handleSecondServeResult("ace")}
          />
          <SelectionButton
            isSelected={pointData.secondServeResult === "returned"}
            label="Returned"
            onClick={() => handleSecondServeResult("returned")}
          />
        </div>
      ) : null}

      {currentStep === "secondServeMiss" ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {(["Long", "Wide", "Net"] as MissType[]).map((miss) => (
            <SelectionButton
              isSelected={pointData.secondServeMiss === miss}
              key={miss}
              label={miss}
              onClick={() => handleSecondServeMiss(miss)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === "return" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SelectionButton
            isSelected={pointData.returnResult === "inPlay"}
            label="In Play"
            onClick={() => handleReturnResult("inPlay")}
          />
          <SelectionButton
            isSelected={pointData.returnResult === "winnerForcedError"}
            label="Winner/forced error"
            onClick={() => handleReturnResult("winnerForcedError")}
          />
          <SelectionButton
            isSelected={pointData.returnResult === "unforcedError"}
            label="Unforced error"
            onClick={() => handleReturnResult("unforcedError")}
          />
        </div>
      ) : null}

      {currentStep === "rally" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["3", "4", "5", "6", "7+"] as RallyLength[]).map((length) => (
            <SelectionButton
              isSelected={pointData.rallyLength === length}
              key={length}
              label={length}
              onClick={() => handleRallyLength(length)}
            />
          ))}
        </div>
      ) : null}

      {currentStep === "outcome" ? (
        <div className="mt-5 space-y-5">
          <div className="rounded-xl bg-neutral-100 px-4 py-3">
            <p className="text-sm font-medium text-neutral-800">Point winner</p>
            <p className="mt-1 text-sm text-neutral-600">
              {inferredWinner
                ? `${inferredWinner === "player1" ? "Player 1" : "Player 2"} selected automatically`
                : "Winner could not be inferred automatically for this point yet."}
            </p>
          </div>

          {!inferredWinner ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-800">Pick winner</p>
              <div className="grid grid-cols-2 gap-3">
                <SelectionButton
                  isSelected={pointData.winner === "player1"}
                  label="Player 1"
                  onClick={() =>
                    setPointData((currentData) => ({
                      ...currentData,
                      winner: "player1",
                    }))
                  }
                />
                <SelectionButton
                  isSelected={pointData.winner === "player2"}
                  label="Player 2"
                  onClick={() =>
                    setPointData((currentData) => ({
                      ...currentData,
                      winner: "player2",
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-800">Extras (optional)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SHOT_TYPES.map((shotType) => (
                <SelectionButton
                  isSelected={pointData.shotType === shotType}
                  key={shotType}
                  label={shotType}
                  onClick={() =>
                    setPointData((currentData) => ({
                      ...currentData,
                      shotType,
                    }))
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {EXTRA_DIRECTIONS.map((direction) => (
                <SelectionButton
                  isSelected={pointData.extraDirection === direction}
                  key={direction}
                  label={direction}
                  onClick={() =>
                    setPointData((currentData) => ({
                      ...currentData,
                      extraDirection: direction,
                    }))
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["Net", "Long", "Wide"] as MissType[]).map((errorType) => (
                <SelectionButton
                  isSelected={pointData.errorType === errorType}
                  key={errorType}
                  label={errorType}
                  onClick={() =>
                    setPointData((currentData) => ({
                      ...currentData,
                      errorType,
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={!inferredWinner}
            onClick={() => void handleConfirmPoint()}
            type="button"
          >
            {isSaving ? "Saving..." : "Confirm Point"}
          </button>
        </div>
      ) : null}

      <div className="mt-5 space-y-3 border-t border-neutral-200 pt-5">
        <p className="text-sm font-medium text-neutral-800">Quick Add Point</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onClick={() => void handleQuickAddPoint("player1")}
            type="button"
          >
            Player 1
          </button>
          <button
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onClick={() => void handleQuickAddPoint("player2")}
            type="button"
          >
            Player 2
          </button>
        </div>
      </div>
    </section>
  );
}
