import { createClient } from "./supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

type Ranking = Tables<"rankings">
type RankingPlayer = Tables<"ranking_jugadores">
type RankingMovement = Tables<"ranking_movimientos">

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

export const getRankingById = async (rankingId: string): Promise<Ranking> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("rankings")
        .select("*")
        .eq("id", rankingId)
        .single()

    if (error) {
        console.error("Error fetching ranking:", error);
        throw error;
    }

    return data;
}

export const createRanking = async (ranking: TablesInsert<"rankings">): Promise<Ranking> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("rankings")
        .insert(ranking)
        .select()
        .single()

    if (error) {
        console.error("Error creating ranking:", error);
        throw error;
    }

    return data;
}

export const updateRanking = async (rankingId: string, changes: TablesUpdate<"rankings">): Promise<Ranking> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("rankings")
        .update(changes)
        .eq("id", rankingId)
        .select()
        .single()

    if (error) {
        console.error("Error updating ranking:", error);
        throw error;
    }

    return data;
}

export const deleteRanking = async (rankingId: string): Promise<void> => {
    const supabase = await createClient()

    const { error } = await supabase
        .from("rankings")
        .delete()
        .eq("id", rankingId)

    if (error) {
        console.error("Error deleting ranking:", error);
        throw error;
    }
}

export const getRankingPlayers = async (rankingId: string): Promise<RankingPlayer[]> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("ranking_jugadores")
        .select("*")
        .eq("ranking_id", rankingId)
        .order("posicion", { ascending: true, nullsFirst: false })

    if (error) {
        console.error("Error fetching ranking players:", error);
        throw error;
    }

    return data;
}

export const getRankingMovements = async (rankingId: string): Promise<RankingMovement[]> => {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("ranking_movimientos")
        .select("*")
        .eq("ranking_id", rankingId)
        .order("fecha", { ascending: false })

    if (error) {
        console.error("Error fetching ranking movements:", error);
        throw error;
    }

    return data;
}