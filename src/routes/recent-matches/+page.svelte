<script lang="ts">
  import { Crown } from "@lucide/svelte";

  let { data } = $props();

  const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" });
</script>

<svelte:head>
  <title>Recent matches · MTG Counter</title>
</svelte:head>

<div class="mb-8 sm:mb-10">
  <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Recent matches</h1>
  <p class="mt-2 text-ink-2">The last ten games the group recorded.</p>
</div>

{#if data.matches.length > 0}
  <ol class="panel divide-y divide-line overflow-hidden">
    {#each data.matches as match}
      {@const date = new Date(match.game_date)}
      <li class="grid gap-4 p-5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6 sm:px-6 lg:grid-cols-[8.5rem_minmax(0,1fr)_16rem] lg:items-center">
        <div class="flex items-baseline gap-2 sm:block">
          <div class="font-semibold">{dayFormat.format(date)}</div>
          <div class="text-sm text-ink-3 tabular-nums">{timeFormat.format(date)}</div>
        </div>

        <ul class="flex flex-wrap gap-1.5" aria-label="Players">
          {#each match.players as player, i}
            {@const isWinner = player === match.winner}
            <li
              title={match.decks_used?.[i]}
              class="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm {isWinner
                ? 'bg-pink-soft font-semibold text-pink-deep ring-1 ring-pink-line'
                : 'bg-sunken font-medium text-ink-2'}"
            >
              {#if isWinner}<Crown class="size-3.5" fill="currentColor" aria-label="Winner" />{/if}
              {player}
            </li>
          {/each}
        </ul>

        <div class="min-w-0 sm:col-start-2 lg:col-start-auto lg:text-right">
          <div class="text-xs font-medium text-ink-3">Winning deck</div>
          <div class="truncate font-medium">{match.winner_deck}</div>
        </div>
      </li>
    {/each}
  </ol>
{:else}
  <div class="panel px-6 py-16 text-center">
    <p class="font-semibold">No matches recorded yet</p>
    <p class="mt-1 text-sm text-ink-3">Finish a game and crown a winner to start the history.</p>
    <a href="/" class="btn-primary mt-6">Start a game</a>
  </div>
{/if}
