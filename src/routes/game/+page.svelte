<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { Dices, Crown, House, Minus, Plus, Trophy, RotateCw } from "@lucide/svelte";
  import { SEAT_COLORS, STARTING_LIFE, TABLE_LAYOUTS } from "$lib/table";

  interface Player {
    name: string;
    deck: string;
    life: number;
    delta: number;
  }

  const DELTA_SETTLE_MS = 1400;

  let players: Player[] = $state([]);
  let deltaTimers: ReturnType<typeof setTimeout>[] = [];

  onMount(() => {
    const names = page.url.searchParams.getAll("player");
    const decks = page.url.searchParams.getAll("deck");
    if (names.length >= 2 && TABLE_LAYOUTS[names.length]) {
      players = names.map((name, i) => ({
        name,
        deck: decks[i] || "Unknown",
        life: STARTING_LIFE,
        delta: 0,
      }));
    } else {
      goto("/", { replaceState: true });
    }
    return () => deltaTimers.forEach(clearTimeout);
  });

  let layout = $derived(TABLE_LAYOUTS[players.length]);

  function adjustLife(index: number, amount: number) {
    const player = players[index];
    player.life += amount;
    player.delta += amount;
    clearTimeout(deltaTimers[index]);
    deltaTimers[index] = setTimeout(() => (player.delta = 0), DELTA_SETTLE_MS);
  }

  let crownDialog = $state(false);
  let congratulationsModal = $state(false);
  let startingPlayerDialog = $state(false);
  let selectedVictorName = $state("");
  let victor = $state<Player | null>(null);
  let playerKills = $state<Record<string, number>>({});
  let startingPlayerIndex = $state(0);
  let saveStatus = $state<"idle" | "saving" | "saved" | "error">("idle");

  function modal(node: HTMLDialogElement, open: boolean) {
    const sync = (isOpen: boolean) => {
      if (isOpen && !node.open) node.showModal();
      if (!isOpen && node.open) node.close();
    };
    sync(open);
    return { update: sync };
  }

  function closeOnBackdrop(event: MouseEvent, close: () => void) {
    if (event.target === event.currentTarget) close();
  }

  function openCrownDialog() {
    selectedVictorName = "";
    playerKills = Object.fromEntries(players.map((p) => [p.name, 0]));
    crownDialog = true;
  }

  function adjustKills(name: string, amount: number) {
    playerKills[name] = Math.max(0, (playerKills[name] || 0) + amount);
  }

  async function saveMatch() {
    if (!victor) return;
    saveStatus = "saving";
    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: players.map((p) => p.name),
          winner: victor.name,
          decks_used: players.map((p) => p.deck),
          winner_deck: victor.deck,
          player_kills: playerKills,
        }),
      });
      saveStatus = response.ok ? "saved" : "error";
    } catch {
      saveStatus = "error";
    }
  }

  function submitVictor() {
    victor = players.find((p) => p.name === selectedVictorName) || null;
    if (!victor) return;
    crownDialog = false;
    congratulationsModal = true;
    saveMatch();
  }

  function rollToSeeWhoStarts() {
    startingPlayerIndex = Math.floor(Math.random() * players.length);
    startingPlayerDialog = true;
  }

  function leaveGame() {
    if (confirm("Leave this game? Life totals will be lost.")) goto("/");
  }
</script>

<svelte:head>
  <title>Game · MTG Counter</title>
  <meta name="theme-color" content="#e4e6ea" />
</svelte:head>

{#if players.length > 0 && layout}
  <div
    class="table"
    style="grid-template-columns: {layout.columns}; grid-template-rows: {layout.rows};"
  >
    {#each players as player, i}
      {@const s = layout.seats[i]}
      <section
        class="seat"
        aria-label="{player.name}, {player.life} life"
        style="grid-column: {s.column}; grid-row: {s.row}; --seat: {SEAT_COLORS[i]};"
      >
        <div class="seat-inner" class:sideways={Math.abs(s.rotation) === 90} style="--rot: {s.rotation}deg;">
          <button class="tap minus" aria-label="{player.name} loses 1 life" onclick={() => adjustLife(i, -1)}>
            <Minus class="tap-icon" strokeWidth={3} />
          </button>
          <button class="tap plus" aria-label="{player.name} gains 1 life" onclick={() => adjustLife(i, 1)}>
            <Plus class="tap-icon" strokeWidth={3} />
          </button>

          <div class="readout" aria-hidden="true">
            <div class="delta-slot">
              {#if player.delta !== 0}
                <span class="delta" transition:fade={{ duration: 180 }}>
                  {player.delta > 0 ? "+" : "−"}{Math.abs(player.delta)}
                </span>
              {/if}
            </div>
            <div class="name">{player.name}</div>
            <div class="life">{player.life}</div>
            <div class="deck">{player.deck}</div>
          </div>
        </div>
      </section>
    {/each}
  </div>

  <div class="hub" role="toolbar" aria-label="Game controls">
    <button class="hub-btn" onclick={leaveGame} aria-label="Leave game">
      <House class="size-5" />
    </button>
    <button class="hub-btn hub-crown" onclick={openCrownDialog} aria-label="End game and crown the winner">
      <Crown class="size-7" fill="currentColor" />
    </button>
    <button class="hub-btn" onclick={rollToSeeWhoStarts} aria-label="Roll for the starting player">
      <Dices class="size-5" />
    </button>
  </div>

  <dialog
    use:modal={crownDialog}
    onclose={() => (crownDialog = false)}
    onclick={(e) => closeOnBackdrop(e, () => (crownDialog = false))}
    class="sheet"
    aria-labelledby="crown-title"
  >
    <div class="p-6 sm:p-7">
      <h2 id="crown-title" class="text-xl font-bold tracking-tight">Who won?</h2>
      <p class="mt-1 text-sm text-ink-2">Pick the winner and log everyone's kills.</p>

      <fieldset class="mt-5 min-w-0">
        <legend class="sr-only">Winner and kills</legend>
        <ul class="flex flex-col gap-2">
          {#each players as player, i}
            {@const isWinner = selectedVictorName === player.name}
            <li
              class="flex items-center gap-3 rounded-xl border p-2 pl-3 transition-colors {isWinner
                ? 'border-pink bg-pink-soft'
                : 'border-line'}"
            >
              <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="winner"
                  value={player.name}
                  bind:group={selectedVictorName}
                  class="size-4 shrink-0"
                />
                <span class="size-2.5 shrink-0 rounded-full" style="background: {SEAT_COLORS[i]}"></span>
                <span class="min-w-0">
                  <span class="block truncate font-semibold">{player.name}</span>
                  <span class="block truncate text-xs text-ink-3">{player.deck}</span>
                </span>
              </label>
              <div class="flex shrink-0 items-center gap-1" role="group" aria-label="{player.name} kills">
                <button
                  class="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-sunken disabled:opacity-30"
                  onclick={() => adjustKills(player.name, -1)}
                  disabled={!playerKills[player.name]}
                  aria-label="One fewer kill for {player.name}"
                >
                  <Minus class="size-4" />
                </button>
                <output class="w-12 text-center text-sm font-semibold tabular-nums">
                  {playerKills[player.name] || 0}
                  <span class="sr-only">kills</span>
                  <span class="block text-[0.625rem] font-medium tracking-wide text-ink-3 uppercase" aria-hidden="true">
                    kills
                  </span>
                </output>
                <button
                  class="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-sunken"
                  onclick={() => adjustKills(player.name, 1)}
                  aria-label="One more kill for {player.name}"
                >
                  <Plus class="size-4" />
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </fieldset>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <button class="btn-secondary" onclick={() => (crownDialog = false)}>Keep playing</button>
        <button class="btn-primary" onclick={submitVictor} disabled={!selectedVictorName}>
          Record win
        </button>
      </div>
    </div>
  </dialog>

  <dialog
    use:modal={congratulationsModal && !!victor}
    onclose={() => (congratulationsModal = false)}
    class="sheet text-center"
    aria-labelledby="victor-title"
  >
    {#if victor}
      <div class="p-7 sm:p-8">
        <div class="mx-auto grid size-16 place-items-center rounded-2xl bg-pink-soft" in:scale={{ start: 0.6, duration: 500 }}>
          <Crown class="size-8 text-pink" fill="currentColor" />
        </div>
        <h2 id="victor-title" class="mt-5 text-3xl font-bold tracking-tight">{victor.name} wins</h2>
        <p class="mt-1.5 text-ink-2">with {victor.deck}</p>

        <p class="mt-5 flex min-h-5 items-center justify-center gap-2 text-sm" role="status">
          {#if saveStatus === "saving"}
            <span class="text-ink-3">Saving match…</span>
          {:else if saveStatus === "saved"}
            <span class="size-1.5 rounded-full bg-pink-bright"></span>
            <span class="text-ink-2">Saved to the leaderboard</span>
          {:else if saveStatus === "error"}
            <span class="font-medium text-pink-deep">Couldn't save this match.</span>
            <button class="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-4" onclick={saveMatch}>
              <RotateCw class="size-3.5" /> Retry
            </button>
          {/if}
        </p>

        <div class="mt-6 grid gap-3">
          <a href="/" class="btn-primary">New game</a>
          <a href="/leaderboard" class="btn-secondary">
            <Trophy class="size-4 text-ink-3" /> Leaderboard
          </a>
        </div>
      </div>
    {/if}
  </dialog>

  <dialog
    use:modal={startingPlayerDialog}
    onclose={() => (startingPlayerDialog = false)}
    onclick={(e) => closeOnBackdrop(e, () => (startingPlayerDialog = false))}
    class="sheet text-center"
    aria-labelledby="start-title"
  >
    <div class="p-7 sm:p-8">
      <div
        class="mx-auto grid size-16 place-items-center rounded-2xl text-white"
        style="background: {SEAT_COLORS[startingPlayerIndex]}"
      >
        <Dices class="size-8" />
      </div>
      <p class="mt-5 text-sm font-medium text-ink-3">Going first</p>
      <h2 id="start-title" class="mt-1 text-4xl font-bold tracking-tight">
        {players[startingPlayerIndex]?.name}
      </h2>
      <div class="mt-7 grid grid-cols-2 gap-3">
        <button class="btn-secondary" onclick={rollToSeeWhoStarts}>Roll again</button>
        <button class="btn-primary" onclick={() => (startingPlayerDialog = false)}>Let's go</button>
      </div>
    </div>
  </dialog>
{/if}

<style>
  :global(body) {
    overflow: hidden;
    overscroll-behavior: none;
    background: #e4e6ea;
  }

  .table {
    display: grid;
    gap: 6px;
    width: 100vw;
    height: 100dvh;
    padding: 6px;
    box-sizing: border-box;
  }

  .seat {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    container-type: size;
    background:
      radial-gradient(130% 90% at 50% 0%, rgb(255 255 255 / 0.2), transparent 60%),
      var(--seat);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.25),
      0 1px 2px rgb(17 19 24 / 0.1);
    user-select: none;
    -webkit-user-select: none;
  }

  .seat-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100cqw;
    height: 100cqh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    container-type: size;
    transform: translate(-50%, -50%) rotate(var(--rot));
  }

  .seat-inner.sideways {
    width: 100cqh;
    height: 100cqw;
  }

  .tap {
    position: relative;
    display: flex;
    align-items: center;
    border: 0;
    background: transparent;
    color: rgb(255 255 255 / 0.7);
    touch-action: manipulation;
    transition: background-color 120ms;
  }

  .tap.minus {
    justify-content: flex-start;
    padding-left: max(14px, 6cqw);
  }

  .tap.plus {
    justify-content: flex-end;
    padding-right: max(14px, 6cqw);
  }

  .tap:active {
    background: rgb(255 255 255 / 0.14);
  }

  .tap:focus-visible {
    outline: 3px solid #fff;
    outline-offset: -6px;
    border-radius: 18px;
  }

  .tap :global(.tap-icon) {
    width: clamp(20px, 9cqmin, 40px);
    height: clamp(20px, 9cqmin, 40px);
  }

  .readout {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1cqh;
    padding: 0 18cqw;
    pointer-events: none;
    color: #fff;
    text-align: center;
  }

  .name {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(0.95rem, 8cqmin, 1.75rem);
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .life {
    font-size: min(46cqh, 30cqw, 11rem);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 2px 12px rgb(0 0 0 / 0.12);
  }

  .delta-slot {
    display: flex;
    justify-content: center;
    height: clamp(1.4rem, 9cqmin, 2.1rem);
    font-size: clamp(0.8rem, 6cqmin, 1.3rem);
  }

  .delta {
    display: inline-flex;
    align-items: center;
    padding: 0 0.6em;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.95);
    color: var(--seat);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .deck {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(0.7rem, 4.5cqmin, 1rem);
    font-weight: 500;
    color: rgb(255 255 255 / 0.85);
  }

  .hub {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px;
    border-radius: 999px;
    background: #fff;
    translate: -50% -50%;
    box-shadow: var(--shadow-lift);
  }

  @media (orientation: portrait) {
    .hub {
      flex-direction: column;
    }
  }

  .hub-btn {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--color-ink-2);
    transition: background-color 150ms, transform 150ms var(--ease-out-expo);
  }

  .hub-btn:hover {
    background: var(--color-sunken);
  }

  .hub-btn:active {
    transform: scale(0.92);
  }

  .hub-crown {
    width: 60px;
    height: 60px;
    background: var(--color-pink);
    color: #fff;
    box-shadow: var(--shadow-pink);
  }

  .hub-crown:hover {
    background: var(--color-pink-deep);
  }

  .sheet {
    margin: auto;
    width: min(28rem, calc(100% - 2rem));
    max-height: calc(100dvh - 2rem);
    border-radius: 1.25rem;
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: var(--shadow-lift);
  }

  .sheet[open] {
    animation: sheet-in 320ms var(--ease-out-expo);
  }

  .sheet::backdrop {
    background: rgb(17 19 24 / 0.45);
    backdrop-filter: blur(4px);
  }

  @keyframes sheet-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet[open] {
      animation: none;
    }
  }
</style>
