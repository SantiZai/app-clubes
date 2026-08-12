import { createClient } from "./supabase/client";
import type { Tables, TablesInsert } from "@/types/database.types";

type TournamentInsert = TablesInsert<"torneos">

export const createTournament = async (tournament: TournamentInsert) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("torneos")
    .insert(tournament)
    .select()
    .single();

  if (error) {
    console.error("Error inserting tournament:", error);
    throw error;
  }

  return data;
}