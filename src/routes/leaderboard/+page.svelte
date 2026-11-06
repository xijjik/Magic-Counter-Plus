<script lang="ts">
  import RankedList from "$lib/components/RankedList.svelte";

  let { data } = $props();

  const playerLink = (name: string) => `/player-stats?player=${encodeURIComponent(name)}`;
  const games = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
</script>

<svelte:head>
  <title>Leaderboard · MTG Counter</title>
</svelte:head>

<div class="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
  <div>
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Leaderboard</h1>
    <p class="mt-2 text-ink-2">
      {#if data.group.playerStats.length}
        <span class="font-semibold text-ink">{data.group.playerStats[0].name}</span> leads the group
        across <span class="tabular-nums">{games(data.group.matchCount, "group game")}</span>.
      {:else}
        Wins, kills and decks from every recorded group game.
      {/if}
    </p>
  </div>
</div>

<div class="grid items-start gap-5 lg:grid-cols-3">
  <RankedList
    title="Player wins"
    unit="Wins"
    entries={data.group.playerStats}
    empty="No group games recorded yet."
    href={playerLink}
  />
  <RankedList
    title="Player kills"
    unit="Kills"
    entries={data.group.killStats}
    empty="No kills recorded yet."
    href={playerLink}
  />
  <RankedList
    title="Deck wins"
    unit="Wins"
    entries={data.group.deckStats}
    empty="No group games recorded yet."
  />
</div>

<div class="mt-12 mb-6">
  <h2 class="text-2xl font-bold tracking-tight">1v1</h2>
  <p class="mt-1 text-ink-2">
    {#if data.oneVsOne.playerStats.length}
      <span class="font-semibold text-ink">{data.oneVsOne.playerStats[0].name}</span> leads
      across <span class="tabular-nums">{games(data.oneVsOne.matchCount, "duel")}</span>.
    {:else}
      Two-player games are tracked separately here.
    {/if}
  </p>
</div>

<div class="grid items-start gap-5 lg:grid-cols-3">
  <RankedList
    title="1v1 wins"
    unit="Wins"
    entries={data.oneVsOne.playerStats}
    empty="No 1v1 games recorded yet."
    href={playerLink}
  />
  <RankedList
    title="1v1 deck wins"
    unit="Wins"
    entries={data.oneVsOne.deckStats}
    empty="No 1v1 games recorded yet."
  />
</div>
