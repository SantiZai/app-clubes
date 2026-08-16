import { createClient } from "./supabase/client";
import type { Tables, TablesInsert } from "@/types/database.types";

type Tournament = Tables<"torneos">
type TournamentInsert = TablesInsert<"torneos">

export const getTournamentsByClubId = async (clubId: string): Promise<Tournament[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("torneos")
    .select("*")
    .eq("club_id", clubId)
    .order("fecha_inicio", { ascending: true });
  
  if (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }

  return data;
}

export const createTournament = async (tournament: TournamentInsert): Promise<Tournament> => {
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