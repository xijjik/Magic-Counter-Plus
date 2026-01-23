<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { PLAYERS } from "$lib/constants";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const urlPlayer = $page.url.searchParams.get("player");
  let selectedPlayer = $state(
    urlPlayer && PLAYERS.includes(urlPlayer) ? urlPlayer : PLAYERS[0],
  );

  $effect(() => {
    const param = $page.url.searchParams.get("player");
    if (param !== selectedPlayer) {
      const newUrl = new URL($page.url);
      newUrl.searchParams.set("player", selectedPlayer);
      goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
    }
  });

  // Derived stats
  let playerMatches = $derived(
    (data.matches || []).filter(
      (m: any) =>
        m.players &&
        Array.isArray(m.players) &&
        m.players.includes(selectedPlayer),
    ),
  );

  let wins = $derived(
    playerMatches.filter((m: any) => m.winner === selectedPlayer).length,
  );
  // Losses: matches where player played but didn't win.
  let losses = $derived(playerMatches.length - wins);

  let deckWins = $derived.by(() => {
    const winsByDeck: Record<string, number> = {};
    playerMatches.forEach((m: any) => {
      if (m.winner === selectedPlayer && m.winner_deck) {
        winsByDeck[m.winner_deck] = (winsByDeck[m.winner_deck] || 0) + 1;
      }
    });
    return Object.entries(winsByDeck).sort((a, b) => b[1] - a[1]);
  });

  let totalKills = $derived.by(() => {
    return playerMatches.reduce((acc: number, m: any) => {
      if (m.player_kills && typeof m.player_kills === "object") {
        const kills = (m.player_kills as Record<string, number>)[
          selectedPlayer
        ];
        return acc + (Number(kills) || 0);
      }
      return acc;
    }, 0);
  });
</script>

<div class="min-h-screen p-5 font-sans">
  <div class="max-w-[800px] mx-auto">
    <div class="mb-5">
      <a href="/" class="text-brand-primary hover:underline font-bold"
        >&larr; Back to Home</a
      >
    </div>

    <div class="bg-white rounded-[20px] p-8 shadow-xl">
      <h1
        class="text-3xl font-bold text-center text-brand-primary mb-8 border-b-2 border-brand-secondary pb-4"
      >
        Player Statistics
      </h1>

      <div class="mb-10 text-center">
        <label
          for="player-select"
          class="block text-gray-500 font-bold mb-2 uppercase text-sm tracking-wider"
          >Select Player</label
        >
        <div class="relative inline-block w-full max-w-sm">
          <select
            id="player-select"
            bind:value={selectedPlayer}
            class="block w-full px-4 py-3 bg-white border-2 border-brand-primary rounded-[10px] text-brand-primary font-bold text-lg focus:outline-none focus:ring-4 focus:ring-brand-primary/20 cursor-pointer"
          >
            {#each PLAYERS as player}
              <option value={player}>{player}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div
          class="text-center p-6 bg-gray-50 rounded-[20px] border-2 border-gray-100 hover:border-brand-primary/30 transition-colors"
        >
          <div class="text-5xl font-black text-brand-primary mb-2">{wins}</div>
          <div
            class="text-gray-400 font-bold uppercase text-xs tracking-widest"
          >
            Wins
          </div>
        </div>
        <div
          class="text-center p-6 bg-gray-50 rounded-[20px] border-2 border-gray-100 hover:border-brand-primary/30 transition-colors"
        >
          <div class="text-5xl font-black text-gray-700 mb-2">{losses}</div>
          <div
            class="text-gray-400 font-bold uppercase text-xs tracking-widest"
          >
            Losses
          </div>
        </div>
        <div
          class="text-center p-6 bg-gray-50 rounded-[20px] border-2 border-gray-100 hover:border-brand-primary/30 transition-colors"
        >
          <div class="text-5xl font-black text-brand-primary mb-2">
            {totalKills}
          </div>
          <div
            class="text-gray-400 font-bold uppercase text-xs tracking-widest"
          >
            Kills
          </div>
        </div>
      </div>

      <div class="border-t-2 border-gray-100 pt-8">
        <h2
          class="text-xl font-bold text-brand-primary mb-6 flex items-center gap-3"
        >
          Wins by Deck
          <span
            class="text-xs font-bold text-white bg-brand-primary px-2 py-1 rounded-full opacity-80"
            >{deckWins.length}</span
          >
        </h2>

        {#if deckWins.length > 0}
          <div class="grid gap-3">
            {#each deckWins as [deck, count]}
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-[15px] border border-gray-100 hover:bg-brand-secondary/30 hover:border-brand-secondary transition-all"
              >
                <span class="font-bold text-gray-800">{deck}</span>
                <span
                  class="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-brand-primary text-white font-bold text-sm shadow-sm"
                >
                  {count}
                </span>
              </div>
            {/each}
          </div>
        {:else}
          <div
            class="text-center py-12 bg-gray-50 rounded-[20px] border border-dashed border-gray-200"
          >
            <p class="text-gray-400 italic">No wins recorded with any deck.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
