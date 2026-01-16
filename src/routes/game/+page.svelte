<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Dices, Crown } from "@lucide/svelte";

  interface Player {
    name: string;
    deck: string;
    life: number;
  }

  let players: Player[] = $state([]);

  onMount(() => {
    const names = $page.url.searchParams.getAll("player");
    const decks = $page.url.searchParams.getAll("deck");
    if (names.length >= 2) {
      players = names.map((name, i) => ({
        name,
        deck: decks[i] || "Unknown",
        life: 30,
      }));
    } else {
      window.location.href = "/";
    }
  });

  function adjustLife(index: number, amount: number) {
    players[index].life += amount;
    players = [...players];
  }

  function getLayoutClass(count: number): string {
    return `layout-${count}`;
  }

  function getRotation(index: number, total: number): number {
    switch (total) {
      case 2:
        return index === 0 ? 180 : 0;
      case 3:
        if (index === 0) return 180;
        return 0;
      case 4:
        return [180, 180, 0, 0][index];
      case 5:
        if (index === 0) return 180;
        return [90, -90, 0, 0][index - 1];
      case 6:
        return [180, 180, 90, -90, 0, 0][index];
      default:
        return 0;
    }
  }

  let crownDialog = $state(false);
  let congratulationsModal = $state(false);
  let selectedVictorName = $state("");
  let victor = $state<Player | null>(null);
  let playerKills = $state<Record<string, number>>({});
  let startingPlayerDialog = $state(false);
  let startingPlayerName = $state("");

  function openCrownDialog() {
    crownDialog = true;
    selectedVictorName = "";
    // Initialize kills for all players
    playerKills = {};
    players.forEach((p) => {
      playerKills[p.name] = 0;
    });
  }

  function closeCrownDialog() {
    crownDialog = false;
  }

  function sendDataToSupabase() {
    if (!victor) return;

    fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        players: players.map((p) => p.name),
        winner: victor.name,
        decks_used: players.map((p) => p.deck),
        winner_deck: victor.deck,
        player_kills: playerKills,
      }),
    });
  }

  function submitVictor() {
    if (selectedVictorName) {
      victor = players.find((p) => p.name === selectedVictorName) || null;
      crownDialog = false;
      sendDataToSupabase();
      congratulationsModal = true;
    }
  }

  function closeCongratulationsModal() {
    congratulationsModal = false;
    victor = null;
  }

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  function rollToSeeWhoStarts() {
    if (players.length > 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      startingPlayerName = players[randomIndex].name;
      startingPlayerDialog = true;
    }
  }

  function closeStartingPlayerDialog() {
    startingPlayerDialog = false;
  }
</script>

<svelte:head>
  <title>MTG Life Counter - Game</title>
</svelte:head>

{#if players.length > 0}
  <div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex gap-5 items-center justify-center"
  >
    <button
      class="crown cursor-pointer"
      onclick={openCrownDialog}
      aria-label="Crown"
    >
      <Crown class="w-14 h-14 text-amber-300 fill-amber-300" />
    </button>
    <button
      class="dice cursor-pointer"
      onclick={rollToSeeWhoStarts}
      aria-label="Dice"
    >
      <Dices class="w-10 h-10 text-white" />
    </button>
  </div>

  {#if crownDialog}
    <div
      class="modal-overlay fixed inset-0 z-20 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.5);"
      onclick={closeCrownDialog}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === "Escape" && closeCrownDialog()}
    >
      <div
        class="modal-content bg-brand-secondary rounded-[20px] p-10 max-w-md w-[90%] shadow-xl max-h-[90vh] overflow-y-auto"
        onclick={stopPropagation}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={(e) => e.key === "Escape" && closeCrownDialog()}
      >
        <h2 class="text-2xl font-bold mb-6 text-center text-brand-primary">
          Who won?
        </h2>

        <div class="mb-6">
          <label
            for="winner-select"
            class="block text-brand-primary font-bold mb-2">Winner</label
          >
          <select
            id="winner-select"
            bind:value={selectedVictorName}
            class="w-full py-3 px-4 border-2 border-brand-primary rounded-[10px] text-base text-brand-primary focus:outline-none focus:border-brand-primary bg-white"
          >
            <option value="">Select a winner...</option>
            {#each players as player}
              <option value={player.name}>{player.name}</option>
            {/each}
          </select>
        </div>

        <div class="mb-8">
          <h3 class="text-brand-primary font-bold mb-3">Player Kills</h3>
          <div class="space-y-3 bg-white/50 p-4 rounded-xl">
            {#each players as player}
              <div class="flex items-center justify-between">
                <span class="text-brand-primary font-medium text-lg"
                  >{player.name}</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-lg font-bold hover:opacity-90 transition-opacity"
                    onclick={() =>
                      (playerKills[player.name] = Math.max(
                        0,
                        (playerKills[player.name] || 0) - 1
                      ))}>-</button
                  >
                  <input
                    type="number"
                    min="0"
                    bind:value={playerKills[player.name]}
                    class="w-16 py-1 px-2 border-2 border-brand-primary rounded-lg text-brand-primary text-center font-bold focus:outline-none bg-white"
                  />
                  <button
                    class="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-lg font-bold hover:opacity-90 transition-opacity"
                    onclick={() =>
                      (playerKills[player.name] =
                        (playerKills[player.name] || 0) + 1)}>+</button
                  >
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="flex gap-4">
          <button
            onclick={closeCrownDialog}
            class="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-[10px] font-semibold hover:bg-gray-200 transition-colors"
            >Cancel</button
          >
          <button
            onclick={submitVictor}
            disabled={!selectedVictorName}
            class="flex-1 py-3 px-4 bg-brand-primary text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >Submit</button
          >
        </div>
      </div>
    </div>
  {/if}

  {#if congratulationsModal && victor}
    <div
      class="modal-overlay fixed inset-0 z-30 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.5);"
      onclick={closeCongratulationsModal}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === "Escape" && closeCongratulationsModal()}
    >
      <div
        class="modal-content bg-brand-secondary rounded-[20px] p-10 max-w-md w-[90%] shadow-xl text-center"
        onclick={stopPropagation}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={(e) => e.key === "Escape" && closeCongratulationsModal()}
      >
        <h2 class="text-4xl font-bold mb-4">🎉 Congratulations!</h2>
        <p class="text-2xl mb-6 font-semibold">{victor.name} wins!</p>
        <a
          href="/"
          class="block w-full py-3 px-4 bg-brand-primary text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity"
          >New game</a
        >
        <div class="mt-4">
          <a
            href="/leaderboard"
            class="block text-center text-brand-primary hover:underline"
          >
            View Leaderboard
          </a>
        </div>
      </div>
    </div>
  {/if}

  {#if startingPlayerDialog}
    <div
      class="modal-overlay fixed inset-0 z-30 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.5);"
      onclick={closeStartingPlayerDialog}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === "Escape" && closeStartingPlayerDialog()}
    >
      <div
        class="modal-content bg-brand-secondary rounded-[20px] p-10 max-w-md w-[90%] shadow-xl text-center"
        onclick={stopPropagation}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onkeydown={(e) => e.key === "Escape" && closeStartingPlayerDialog()}
      >
        <h2 class="text-3xl font-bold mb-6 text-brand-primary">
          Starting Player
        </h2>
        <p class="text-4xl mb-8 font-bold">
          {startingPlayerName}
        </p>
        <button
          onclick={closeStartingPlayerDialog}
          class="w-full py-3 px-4 bg-brand-primary text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      </div>
    </div>
  {/if}

  <div class="game-container {getLayoutClass(players.length)}">
    {#each players as player, i}
      <div class="player-counter player-{i + 1}">
        <div
          class="counter-inner"
          style="transform: rotate({getRotation(i, players.length)}deg);"
        >
          <div class="player-name">{player.name}</div>
          <div class="life-display">{player.life}</div>
          <div class="button-group">
            <button class="life-btn minus" onclick={() => adjustLife(i, -1)}
              >-</button
            >
            <button class="life-btn plus" onclick={() => adjustLife(i, 1)}
              >+</button
            >
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #1a1a1a;
  }

  .game-container {
    width: 100vw;
    height: 100vh;
    display: grid;
    gap: 2px;
  }

  .layout-2 {
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr;
  }

  .layout-3 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .layout-3 .player-1 {
    grid-column: 1 / 3;
    grid-row: 1;
  }

  .layout-3 .player-2 {
    grid-column: 1;
    grid-row: 2;
  }

  .layout-3 .player-3 {
    grid-column: 2;
    grid-row: 2;
  }

  .layout-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .layout-4 .player-1 {
    grid-column: 1;
    grid-row: 1;
  }

  .layout-4 .player-2 {
    grid-column: 2;
    grid-row: 1;
  }

  .layout-4 .player-3 {
    grid-column: 1;
    grid-row: 2;
  }

  .layout-4 .player-4 {
    grid-column: 2;
    grid-row: 2;
  }

  .layout-5 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0.3fr 0.35fr 0.35fr;
  }

  .layout-5 .player-1 {
    grid-column: 1 / 3;
    grid-row: 1;
  }

  .layout-5 .player-2 {
    grid-column: 1;
    grid-row: 2;
  }

  .layout-5 .player-3 {
    grid-column: 2;
    grid-row: 2;
  }

  .layout-5 .player-4 {
    grid-column: 1;
    grid-row: 3;
  }

  .layout-5 .player-5 {
    grid-column: 2;
    grid-row: 3;
  }

  .layout-6 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }

  .layout-6 .player-1 {
    grid-column: 1;
    grid-row: 1;
  }

  .layout-6 .player-2 {
    grid-column: 2;
    grid-row: 1;
  }

  .layout-6 .player-3 {
    grid-column: 1;
    grid-row: 2;
  }

  .layout-6 .player-4 {
    grid-column: 2;
    grid-row: 2;
  }

  .layout-6 .player-5 {
    grid-column: 1;
    grid-row: 3;
  }

  .layout-6 .player-6 {
    grid-column: 2;
    grid-row: 3;
  }

  .player-counter {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    position: relative;
    overflow: hidden;
  }

  .player-1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .player-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  .player-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  .player-4 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  .player-5 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
  .player-6 {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  }

  .counter-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    text-align: center;
  }

  .player-name {
    font-size: clamp(0.9rem, 2.5vw, 1.5rem);
    font-weight: 700;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .life-display {
    font-size: clamp(3rem, 10vw, 8rem);
    font-weight: 900;
    color: white;
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5);
    line-height: 1;
    user-select: none;
  }

  .button-group {
    display: flex;
    gap: 15px;
  }

  .life-btn {
    width: clamp(50px, 8vw, 80px);
    height: clamp(50px, 8vw, 80px);
    border-radius: 50%;
    border: 3px solid white;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    user-select: none;
    touch-action: manipulation;
  }

  .life-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .life-btn:active {
    transform: scale(0.95);
  }
</style>
