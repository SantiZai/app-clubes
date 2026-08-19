import { createClient } from "./supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type Club = Tables<"clubes">
type Court = Tables<"canchas">
type CourtInsert = TablesInsert<"canchas">
type CourtUpdate = TablesUpdate<"canchas">

export const getAdminClub = async (adminId: string): Promise<Club> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("clubes")
    .select()
    .eq("admin_id", adminId)
    .single();

    if (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      console.error(`Error fetching club for admin_id ${adminId}:`, errorMsg);
      throw new Error(`Failed to fetch club for admin: ${errorMsg}`);
    }

    return data;
}

export const updateClub = async (clubId: string, changes: TablesUpdate<"clubes">): Promise<Club> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clubes")
    .update(changes)
    .eq("id", clubId)
    .select()
    .single();

  if (error) {
    console.error("Error updating club:", error);
    throw error;
  }

  return data;
};

export const getCourtsByClubId = async (clubId: string): Promise<Court[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("canchas")
    .select("*")
    .eq("club_id", clubId)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching club courts:", error);
    throw error;
  }

  return data;
};

export const createCourt = async (court: CourtInsert): Promise<Court> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("canchas")
    .insert(court)
    .select()
    .single();

  if (error) {
    console.error("Error creating court:", error);
    throw error;
  }

  return data;
};

export const updateCourt = async (courtId: string, changes: CourtUpdate): Promise<Court> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("canchas")
    .update(changes)
    .eq("id", courtId)
    .select()
    .single();

  if (error) {
    console.error("Error updating court:", error);
    throw error;
  }

  return data;
};

export const deleteCourt = async (courtId: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("canchas")
    .delete()
    .eq("id", courtId);

  if (error) {
    console.error("Error deleting court:", error);
    throw error;
  }
};