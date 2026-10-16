<script lang="ts">
  import { SEAT_COLORS } from "$lib/table";

  let { data } = $props();

  let stats = $derived(data.stats);
  let totals = $derived([
    { label: "Games", value: stats.totals.games },
    { label: "Kills", value: stats.totals.kills },
    { label: "Players", value: stats.totals.players },
    { label: "Decks played", value: stats.totals.decks },
  ]);

  const accentOf = (i: number) => SEAT_COLORS[i % SEAT_COLORS.length];
  const heatOf = (value: number) => (value / stats.headToHead.max) * 0.9;
</script>

<svelte:head>
  <title>Stats · MTG Counter</title>
</svelte:head>

<div class="mb-8 sm:mb-10">
  <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">The numbers</h1>
  <p class="mt-2 text-ink-2">Bragging rights and grudges, recalculated after every match.</p>
</div>

<section class="panel" aria-label="Totals">
  <dl class="grid grid-cols-2 sm:grid-cols-4">
    {#each totals as total, i}
      <div class="border-line px-5 py-5 sm:px-6 {i > 0 ? 'sm:border-l' : ''} {i % 2 === 1 ? 'border-l' : ''} {i >= 2 ? 'border-t sm:border-t-0' : ''}">
        <dt class="text-sm font-medium text-ink-3">{total.label}</dt>
        <dd class="mt-1 text-4xl font-bold tracking-tight tabular-nums">{total.value}</dd>
      </div>
    {/each}
  </dl>
</section>

{#if stats.facts.length === 0}
  <p class="mt-5 rounded-xl border border-dashed border-line-strong px-4 py-16 text-center text-sm text-ink-3">
    Play a few more games and the stats will start rolling in.
  </p>
{:else}
  <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each stats.facts as fact, i}
      <article class="panel relative overflow-hidden p-6">
        <span class="absolute inset-x-0 top-0 h-1.5" style="background: {accentOf(i)}"></span>
        <h2 class="text-xs font-semibold tracking-wider text-ink-3 uppercase">{fact.title}</h2>
        <p class="mt-3 text-6xl leading-none font-bold tracking-tight tabular-nums" style="color: {accentOf(i)}">
          {fact.value}
        </p>
        {#if fact.subject}
          <p class="mt-4 text-lg leading-snug font-semibold">{fact.subject}</p>
        {/if}
        <p class="mt-1 text-sm text-ink-2">{fact.detail}</p>
      </article>
    {/each}
  </div>
{/if}

{#if stats.headToHead.names.length > 1}
  <section class="panel mt-5 p-5 sm:p-6" aria-labelledby="h2h-title">
    <h2 id="h2h-title" class="text-base font-semibold">Who beats who</h2>
    <p class="mt-1 text-sm text-ink-3">Times the row player won a game the column player was in.</p>
    <div class="-mx-5 mt-4 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
      <table class="border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th scope="col"><span class="sr-only">Winner</span></th>
            {#each stats.headToHead.names as name}
              <th scope="col" class="px-1 pb-1 text-xs font-medium text-ink-3">{name}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each stats.headToHead.rows as row, r}
            <tr>
              <th scope="row" class="pr-2 text-right font-semibold whitespace-nowrap">{stats.headToHead.names[r]}</th>
              {#each row as value}
                {#if value === null}
                  <td class="size-11 rounded-md bg-sunken"></td>
                {:else}
                  <td
                    class="size-11 min-w-11 rounded-md text-center font-semibold tabular-nums {heatOf(value) > 0.5
                      ? 'text-white'
                      : value
                        ? 'text-ink'
                        : 'text-ink-3'}"
                    style="background: rgb(224 0 122 / {heatOf(value)})"
                  >
                    {value}
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
