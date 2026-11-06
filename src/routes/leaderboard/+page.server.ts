import { supabaseServer } from "$lib/clients/supabaseServer";
import { isOneVsOne, type Match } from "$lib/funStats";

const ranked = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

function tally(matches: Match[]) {
  const playerWins: Record<string, number> = {};
  const deckWins: Record<string, number> = {};
  const playerKills: Record<string, number> = {};

  matches.forEach((match) => {
    if (match.winner) {
      playerWins[match.winner] = (playerWins[match.winner] || 0) + 1;
    }
    if (match.winner_deck) {
      deckWins[match.winner_deck] = (deckWins[match.winner_deck] || 0) + 1;
    }
    Object.entries(match.player_kills ?? {}).forEach(([player, kills]) => {
      playerKills[player] = (playerKills[player] || 0) + kills;
    });
  });

  return {
    playerStats: ranked(playerWins),
    deckStats: ranked(deckWins),
    killStats: ranked(playerKills),
    matchCount: matches.length,
  };
}

export async function load() {
  const { data, error } = await supabaseServer.from("matches").select("*");

  if (error) {
    console.error("Error fetching matches data:", error);
  }

  const matches = (data ?? []) as Match[];

  return {
    group: tally(matches.filter((m) => !isOneVsOne(m))),
    oneVsOne: tally(matches.filter(isOneVsOne)),
  };
}
