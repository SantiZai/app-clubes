import { createClient } from "./supabase/client"
import type { Tables } from "@/types/database.types";

type Club = Tables<"clubes">

export const getAdminClub = async (adminId: string): Promise<Club> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("clubes")
    .select()
    .eq("admin_id", adminId)
    .single();

    if (error) {
      console.error(`Error fetching club for the id ${adminId}, error message:`, error);
      throw error;
    }

    return data;
}