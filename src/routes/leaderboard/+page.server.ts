
import { supabaseServer } from "$lib/clients/supabaseServer";

export async function load() {
  console.log('--- Leaderboard Load Function Initiated ---');

  console.log('Attempting to fetch data from Supabase matches table...');
  const { data: matches, error } = await supabaseServer
    .from('matches')
    .select('*');

  if (error) {
    console.error('Error fetching matches data:', error);
    return { playerStats: [], deckStats: [], killStats: [] };
  }

  // Calculate stats
  const playerWins: Record<string, number> = {};
  const deckWins: Record<string, number> = {};
  const playerKills: Record<string, number> = {};

  matches?.forEach((match) => {
    if (match.winner) {
      playerWins[match.winner] = (playerWins[match.winner] || 0) + 1;
    }
    if (match.winner_deck) {
      deckWins[match.winner_deck] = (deckWins[match.winner_deck] || 0) + 1;
    }
    if (match.player_kills) {
      Object.entries(match.player_kills as Record<string, number>).forEach(([player, kills]) => {
        playerKills[player] = (playerKills[player] || 0) + kills;
      });
    }
  });

  // Convert to arrays and sort
  const playerStats = Object.entries(playerWins)
    .map(([name, wins]) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins);

  const deckStats = Object.entries(deckWins)
    .map(([name, wins]) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins);
    
  const killStats = Object.entries(playerKills)
    .map(([name, kills]) => ({ name, kills }))
    .sort((a, b) => b.kills - a.kills);

  return {
    playerStats,
    deckStats,
    killStats
  };
}
