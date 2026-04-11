import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export type CreateMatchInput = {
  match_date: string;
  player1_name: string;
  player2_name: string;
};

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  return supabaseUrl;
}

function getSupabaseAnonKey() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabaseAnonKey;
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return supabaseClient;
}

export async function fetchMatches() {
  return getSupabaseClient().from("matches").select("*");
}

export async function createMatch(match: CreateMatchInput) {
  return getSupabaseClient()
    .from("matches")
    .insert(match)
    .select("id")
    .single();
}
