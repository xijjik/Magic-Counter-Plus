
import { supabaseServer } from "$lib/clients/supabaseServer";

export async function load() {
  const { data: matches, error } = await supabaseServer
    .from('matches')
    .select('*')
    .order('game_date', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching matches:', error);
    return { matches: [] };
  }

  return {
    matches: matches || []
  };
}
