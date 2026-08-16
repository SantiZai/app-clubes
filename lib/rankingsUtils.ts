import { createClient } from "./supabase/client"
import type { Tables } from "@/types/database.types"

type Ranking = Tables<"rankings">

export const getRankingsByClubId = async (clubId: string): Promise<Ranking[]> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("rankings")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching rankings:", error);
        throw error;
    }

    return data;
}