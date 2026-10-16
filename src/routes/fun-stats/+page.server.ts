import { supabaseServer } from "$lib/clients/supabaseServer"
import { computeFunStats, type Match } from "$lib/funStats"

export async function load() {
    const { data: matches, error } = await supabaseServer.from("matches").select("*")

    if (error) {
        console.error("Error fetching matches:", error)
    }

    return { stats: computeFunStats((matches ?? []) as Match[]) }
}
