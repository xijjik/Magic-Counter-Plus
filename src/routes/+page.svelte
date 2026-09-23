<script lang="ts">
  import { goto } from "$app/navigation";
  import { dev } from "$app/environment";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import { PLAYERS, DECKS } from "$lib/constants";
  import { SEAT_COLORS, TABLE_LAYOUTS } from "$lib/table";
  import { Crown, ArrowRight, LockKeyhole } from "@lucide/svelte";

  injectAnalytics({ mode: dev ? "development" : "production" });

  let { data, form } = $props();

  const POD_SIZES = [2, 3, 4, 5, 6];

  let playerCount = $state(4);
  let participants = $state(
    Array.from({ length: 6 }, () => ({ name: "", deck: "" })),
  );

  let seated = $derived(participants.slice(0, playerCount));
  let readyCount = $derived(seated.filter((p) => p.name && p.deck).length);
  let isReady = $derived(readyCount === playerCount);
  let layout = $derived(TABLE_LAYOUTS[playerCount]);

  function isTakenElsewhere(name: string, seatIndex: number) {
    return seated.some((p, i) => i !== seatIndex && p.name === name);
  }

  function startGame() {
    if (!isReady) return;
    const params = new URLSearchParams();
    seated.forEach((p) => {
      params.append("player", p.name);
      params.append("deck", p.deck);
    });
    goto(`/game?${params.toString()}`);
  }
</script>

{#if data.authenticated}
  <div class="mb-8 sm:mb-10">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">New game</h1>
    <p class="mt-2 text-ink-2">Choose the pod, seat everyone with a deck, then deal in.</p>
  </div>

  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <section class="panel p-5 sm:p-7" aria-labelledby="seats-heading">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 id="seats-heading" class="text-lg font-semibold">Seats</h2>
        <div
          role="radiogroup"
          aria-label="Number of players"
          class="flex rounded-xl bg-sunken p-1"
        >
          {#each POD_SIZES as count}
            <button
              role="radio"
              aria-checked={playerCount === count}
              class="h-9 w-11 rounded-lg text-sm font-semibold tabular-nums transition-all duration-200 {playerCount ===
              count
                ? 'bg-surface text-pink shadow-panel'
                : 'text-ink-2 hover:text-ink'}"
              onclick={() => (playerCount = count)}
            >
              {count}
            </button>
          {/each}
        </div>
      </div>

      <ol class="mt-6 divide-y divide-line border-t border-line">
        {#each seated as participant, i (i)}
          <li class="grid gap-3 py-4 sm:grid-cols-[6.5rem_1fr_1.4fr] sm:items-center sm:gap-4">
            <div class="flex items-center gap-2.5">
              <span
                class="grid size-7 place-items-center rounded-lg text-xs font-bold text-white tabular-nums"
                style="background: {SEAT_COLORS[i]}"
              >
                {i + 1}
              </span>
              <span class="text-sm font-medium text-ink-2">Seat {i + 1}</span>
            </div>
            <label class="block">
              <span class="sr-only">Seat {i + 1} player</span>
              <select class="field" bind:value={participant.name} required>
                <option value="" disabled>Player</option>
                {#each PLAYERS as player}
                  <option value={player} disabled={isTakenElsewhere(player, i)}>{player}</option>
                {/each}
              </select>
            </label>
            <label class="block">
              <span class="sr-only">Seat {i + 1} deck</span>
              <select class="field" bind:value={participant.deck} required>
                <option value="" disabled>Deck</option>
                {#each DECKS as deck}
                  <option value={deck}>{deck}</option>
                {/each}
              </select>
            </label>
          </li>
        {/each}
      </ol>
    </section>

    <aside class="panel p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Table preview">
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-semibold">The table</h2>
        <span class="text-sm text-ink-3 tabular-nums">{readyCount}/{playerCount} ready</span>
      </div>

      <div
        class="relative mt-4 grid aspect-3/4 gap-1.5 rounded-xl bg-sunken p-1.5 sm:aspect-4/3 lg:aspect-3/4"
        style="grid-template-columns: {layout.columns}; grid-template-rows: {layout.rows};"
      >
        {#each layout.seats as s, i}
          {@const p = seated[i]}
          <div
            class="flex min-w-0 flex-col items-center justify-center rounded-lg px-2 text-center transition-all duration-300 ease-out-expo"
            style="grid-column: {s.column}; grid-row: {s.row}; background: {p.name
              ? SEAT_COLORS[i]
              : 'var(--color-surface)'}; {p.name ? '' : `box-shadow: inset 0 0 0 1.5px ${SEAT_COLORS[i]}40`}"
          >
            <span
              class="max-w-full truncate text-sm font-semibold {p.name ? 'text-white' : 'text-ink-3'}"
            >
              {p.name || `Seat ${i + 1}`}
            </span>
            {#if p.deck}
              <span class="max-w-full truncate text-[0.6875rem] text-white/85">{p.deck}</span>
            {/if}
          </div>
        {/each}
        <span
          class="absolute top-1/2 left-1/2 grid size-9 -translate-1/2 place-items-center rounded-full bg-surface shadow-lift"
        >
          <Crown class="size-4 text-pink" />
        </span>
      </div>

      <button class="btn-primary mt-5 w-full" disabled={!isReady} onclick={startGame}>
        Start game
        <ArrowRight class="size-4" />
      </button>
      <p class="mt-3 text-center text-xs text-ink-3">
        {isReady ? "Everyone starts on 30 life." : "Every seat needs a player and a deck."}
      </p>
    </aside>
  </div>
{:else}
  <div class="grid min-h-[60dvh] place-items-center">
    <div class="panel w-full max-w-sm p-7">
      <span class="grid size-11 place-items-center rounded-xl bg-pink-soft">
        <LockKeyhole class="size-5 text-pink" />
      </span>
      <h1 class="mt-5 text-2xl font-bold tracking-tight">Sign in to play</h1>
      <p class="mt-1.5 text-sm text-ink-2">
        Starting a game needs the group password. The leaderboard and stats are open to everyone.
      </p>
      <form method="POST" class="mt-6 flex flex-col gap-4">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            class="field"
            autocomplete="current-password"
            aria-invalid={form?.incorrect ? "true" : undefined}
            aria-describedby={form?.incorrect ? "password-error" : undefined}
            required
          />
        </label>
        {#if form?.incorrect}
          <p id="password-error" class="-mt-1 text-sm font-medium text-pink-deep">
            That password didn't match. Try again.
          </p>
        {/if}
        <button type="submit" class="btn-primary w-full">Enter</button>
      </form>
    </div>
  </div>
{/if}
