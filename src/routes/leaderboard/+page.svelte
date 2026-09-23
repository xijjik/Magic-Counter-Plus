<script lang="ts">
  import RankedList from "$lib/components/RankedList.svelte";

  let { data } = $props();

  const toEntries = <T extends { name: string }>(rows: T[], key: keyof T) =>
    rows.map((row) => ({ name: row.name, value: Number(row[key]) }));

  const playerLink = (name: string) => `/player-stats?player=${encodeURIComponent(name)}`;
</script>

<svelte:head>
  <title>Leaderboard · MTG Counter</title>
</svelte:head>

<div class="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
  <div>
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Leaderboard</h1>
    <p class="mt-2 text-ink-2">
      {#if data.playerStats.length}
        <span class="font-semibold text-ink">{data.playerStats[0].name}</span> leads the group
        across <span class="tabular-nums">{data.matchCount}</span> recorded {data.matchCount === 1 ? "match" : "matches"}.
      {:else}
        Wins, kills and decks from every recorded match.
      {/if}
    </p>
  </div>
</div>

<div class="grid items-start gap-5 lg:grid-cols-3">
  <RankedList
    title="Player wins"
    unit="Wins"
    entries={toEntries(data.playerStats, "wins")}
    empty="No matches recorded yet."
    href={playerLink}
  />
  <RankedList
    title="Player kills"
    unit="Kills"
    entries={toEntries(data.killStats, "kills")}
    empty="No kills recorded yet."
    href={playerLink}
  />
  <RankedList
    title="Deck wins"
    unit="Wins"
    entries={toEntries(data.deckStats, "wins")}
    empty="No matches recorded yet."
  />
</div>
