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
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      console.error(`Error fetching club for admin_id ${adminId}:`, errorMsg);
      throw new Error(`Failed to fetch club for admin: ${errorMsg}`);
    }

    return data;
}