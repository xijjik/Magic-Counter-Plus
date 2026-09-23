<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { PLAYERS } from "$lib/constants";
  import RankedList from "$lib/components/RankedList.svelte";
  import type { PageData } from "./$types";

  interface Match {
    players: string[];
    winner: string;
    winner_deck: string;
    decks_used?: string[];
    player_kills?: Record<string, number>;
  }

  let { data }: { data: PageData } = $props();

  const urlPlayer = page.url.searchParams.get("player");
  let selectedPlayer = $state(
    urlPlayer && PLAYERS.includes(urlPlayer) ? urlPlayer : PLAYERS[0],
  );

  $effect(() => {
    if (page.url.searchParams.get("player") !== selectedPlayer) {
      const newUrl = new URL(page.url);
      newUrl.searchParams.set("player", selectedPlayer);
      goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
    }
  });

  const tally = (names: (string | undefined)[]) => {
    const counts: Record<string, number> = {};
    names.forEach((n) => n && (counts[n] = (counts[n] || 0) + 1));
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  let playerMatches = $derived(
    ((data.matches || []) as Match[]).filter(
      (m) => Array.isArray(m.players) && m.players.includes(selectedPlayer),
    ),
  );
  let wins = $derived(playerMatches.filter((m) => m.winner === selectedPlayer).length);
  let losses = $derived(playerMatches.length - wins);
  let winRate = $derived(playerMatches.length ? Math.round((wins / playerMatches.length) * 100) : 0);
  let totalKills = $derived(
    playerMatches.reduce((acc, m) => acc + (Number(m.player_kills?.[selectedPlayer]) || 0), 0),
  );
  let deckWins = $derived(
    tally(playerMatches.filter((m) => m.winner === selectedPlayer).map((m) => m.winner_deck)),
  );
  let decksPlayed = $derived(
    tally(playerMatches.map((m) => m.decks_used?.[m.players.indexOf(selectedPlayer)])),
  );

  let stats = $derived([
    { label: "Wins", value: wins, accent: true },
    { label: "Losses", value: losses },
    { label: "Kills", value: totalKills },
    { label: "Win rate", value: `${winRate}%` },
  ]);
</script>

<svelte:head>
  <title>{selectedPlayer} · MTG Counter</title>
</svelte:head>

<div class="mb-6 sm:mb-8">
  <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Players</h1>
  <p class="mt-2 text-ink-2">Pick someone to see their record.</p>
</div>

<div role="radiogroup" aria-label="Player" class="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
  {#each PLAYERS as player}
    {@const active = player === selectedPlayer}
    <button
      role="radio"
      aria-checked={active}
      onclick={() => (selectedPlayer = player)}
      class="h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-all duration-200 {active
        ? 'bg-ink text-white shadow-panel'
        : 'border border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink'}"
    >
      {player}
    </button>
  {/each}
</div>

<section class="panel overflow-hidden" aria-label="{selectedPlayer} summary">
  <div class="flex items-center gap-4 p-5 sm:p-7">
    <span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-pink text-2xl font-bold text-white">
      {selectedPlayer[0]}
    </span>
    <div class="min-w-0">
      <h2 class="truncate text-2xl font-bold tracking-tight">{selectedPlayer}</h2>
      <p class="text-sm text-ink-3">
        <span class="tabular-nums">{playerMatches.length}</span>
        {playerMatches.length === 1 ? "game" : "games"} played
      </p>
    </div>
  </div>
  <dl class="grid grid-cols-2 border-t border-line sm:grid-cols-4">
    {#each stats as stat, i}
      <div
        class="px-5 py-5 sm:px-7 sm:py-6 {i % 2 === 1 ? 'border-l border-line' : ''} {i >= 2
          ? 'border-t border-line sm:border-t-0'
          : ''} {i === 2 ? 'sm:border-l' : ''}"
      >
        <dt class="text-sm font-medium text-ink-3">{stat.label}</dt>
        <dd class="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl {stat.accent ? 'text-pink' : ''}">
          {stat.value}
        </dd>
      </div>
    {/each}
  </dl>
</section>

<div class="mt-5 grid items-start gap-5 md:grid-cols-2">
  <RankedList title="Wins by deck" unit="Wins" entries={deckWins} empty="No wins with any deck yet." />
  <RankedList title="Most played decks" unit="Games" entries={decksPlayed} empty="No games recorded yet." />
</div>
