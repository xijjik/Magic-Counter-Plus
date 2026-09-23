<script lang="ts">
  interface Entry {
    name: string;
    value: number;
  }

  let {
    title,
    entries,
    unit,
    empty,
    href,
  }: {
    title: string;
    entries: Entry[];
    unit: string;
    empty: string;
    href?: (name: string) => string;
  } = $props();

  const VISIBLE_LIMIT = 10;

  let isExpanded = $state(false);
  let max = $derived(Math.max(1, ...entries.map((e) => e.value)));
  let visible = $derived(isExpanded ? entries : entries.slice(0, VISIBLE_LIMIT));
  const rankOf = (value: number) => entries.findIndex((e) => e.value === value) + 1;
</script>

<section class="panel flex flex-col p-5 sm:p-6" aria-label={title}>
  <div class="flex items-baseline justify-between gap-4">
    <h2 class="text-base font-semibold">{title}</h2>
    <span class="text-xs font-medium text-ink-3">{unit}</span>
  </div>

  {#if entries.length === 0}
    <p class="mt-6 rounded-xl border border-dashed border-line-strong px-4 py-10 text-center text-sm text-ink-3">
      {empty}
    </p>
  {:else}
    <ol class="mt-4 flex flex-col">
      {#each visible as entry}
        {@const rank = rankOf(entry.value)}
        {@const isLeader = rank === 1}
        {@const label = href ? "a" : "div"}
        <li>
          <svelte:element
            this={label}
            href={href?.(entry.name)}
            class="group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-lg px-2 py-2.5 {href
              ? '-mx-2 transition-colors hover:bg-canvas'
              : '-mx-2'}"
          >
            <span class="text-sm font-semibold tabular-nums {isLeader ? 'text-pink' : 'text-ink-3'}">{rank}</span>
            <span class="truncate text-[0.9375rem] {isLeader ? 'font-semibold' : 'font-medium'}">{entry.name}</span>
            <span class="text-[0.9375rem] font-semibold tabular-nums">{entry.value}</span>
            <span class="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full bg-sunken">
              <span
                class="block h-full rounded-full {isLeader ? 'bg-pink-bright' : 'bg-line-strong'}"
                style="width: {(entry.value / max) * 100}%"
              ></span>
            </span>
          </svelte:element>
        </li>
      {/each}
    </ol>
    {#if entries.length > VISIBLE_LIMIT}
      <button
        class="mt-3 h-10 rounded-lg border border-line text-sm font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
        onclick={() => (isExpanded = !isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Show top 10" : `Show all ${entries.length}`}
      </button>
    {/if}
  {/if}
</section>
