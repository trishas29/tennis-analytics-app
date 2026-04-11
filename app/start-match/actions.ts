"use server";

import { redirect } from "next/navigation";

import { createMatch } from "@/lib/supabaseClient";

export async function startMatch(formData: FormData) {
  const player1Name = String(formData.get("player1_name") ?? "").trim();
  const player2Name = String(formData.get("player2_name") ?? "").trim();

  const { data, error } = await createMatch({
    match_date: new Date().toISOString(),
    player1_name: player1Name,
    player2_name: player2Name,
  });

  if (error || !data?.id) {
    const message = error?.message ?? "Unable to create match.";

    redirect(`/start-match?error=${encodeURIComponent(message)}`);
  }

  redirect(`/match/${data.id}`);
}
