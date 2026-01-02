
import { supabase } from "$lib/clients/supabaseClient";

export async function load() {
  console.log('--- Leaderboard Load Function Initiated ---');

  console.log('Attempting to fetch data from Supabase...');
  const { data, error } = await supabase
    .from('leaderboard')
    .select('players, wins')
    .order('wins', { ascending: false });

  if (error) {
    console.error('Error fetching leaderboard data:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { players: [] };
  }

  console.log('Successfully fetched data.');
  console.log('Data count:', data ? data.length : 0);
  console.log('Data sample:', data ? data.slice(0, 2) : 'No data');

  return {
    players: data ?? []
  };
}
