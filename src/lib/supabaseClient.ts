import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export type CreateMatchInput = {
  match_date: string;
  player1_name: string;
  player2_name: string;
};

export type PointInsertInput = {
  end_type?: string;
  error_type?: string;
  first_serve_direction?: string;
  first_serve_in?: boolean;
  first_serve_result?: string;
  game_number?: number;
  is_tracked: boolean;
  match_id: string;
  point_in_game?: number;
  rally_length?: number;
  second_serve_direction?: string;
  second_serve_in?: boolean;
  second_serve_result?: string;
  server?: string;
  set_number?: number;
  shot_detail?: string;
  shot_type?: string;
  winner: string;
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

export async function createPoint(point: PointInsertInput) {
  return getSupabaseClient().from("points").insert(point).select("id").single();
}
