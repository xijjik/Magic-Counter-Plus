<script lang="ts">
  import { goto } from "$app/navigation";
  import { dev } from "$app/environment";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import { PLAYERS, DECKS } from "$lib/constants";

  injectAnalytics({ mode: dev ? "development" : "production" });

  let playerCount = $state(4);
  let participants = $state<{ name: string; deck: string }[]>([]);

  $effect(() => {
    if (participants.length < playerCount) {
      while (participants.length < playerCount) {
        participants.push({ name: "", deck: "" });
      }
    } else if (participants.length > playerCount) {
      participants = participants.slice(0, playerCount);
    }
  });

  function startGame() {
    // Filter out participants where name or deck is missing? Or just check name?
    // User wants dropdowns, so assuming valid selection if they pick one.
    // Let's ensure both are selected for a valid participant.
    const validParticipants = participants.filter((p) => p.name && p.deck);

    if (validParticipants.length >= 2) {
      const params = new URLSearchParams();
      validParticipants.forEach((p) => {
        params.append("player", p.name);
        params.append("deck", p.deck);
      });
      goto(`/game?${params.toString()}`);
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-5 font-sans">
  <div class="bg-white rounded-[20px] p-10 max-w-[500px] w-full">
    <div class="mb-[30px]">
      <label for="player-count" class="block mb-2.5 font-semibold text-[#555]"
        >Number of Players:</label
      >
      <div class="flex gap-2.5">
        {#each [2, 3, 4, 5, 6] as count}
          <button
            class="flex-1 py-3 px-3 border-2 border-brand-primary rounded-[10px] text-[1.1rem] font-semibold text-brand-primary cursor-pointer transition-all duration-200 {playerCount ===
            count
              ? 'bg-brand-primary text-white'
              : ''}"
            onclick={() => (playerCount = count)}
          >
            {count}
          </button>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-[15px] mb-[30px]">
      {#each participants as participant, i}
        <div class="flex gap-2">
          <div class="flex-1">
            <label
              for="player-{i}"
              class="block mb-[5px] font-semibold text-black"
              >Player {i + 1}:</label
            >
            <select
              id="player-{i}"
              bind:value={participants[i].name}
              required
              class="w-full py-3 px-3 border-2 border-[#ddd] rounded-[10px] text-base box-border transition-[border-color] duration-200 focus:outline-none focus:border-[#667eea]"
            >
              <option value="" disabled selected>Select Player</option>
              {#each PLAYERS as player}
                <option value={player}>{player}</option>
              {/each}
            </select>
          </div>
          <div class="flex-1">
            <label
              for="deck-{i}"
              class="block mb-[5px] font-semibold text-black">Deck:</label
            >
            <select
              id="deck-{i}"
              bind:value={participants[i].deck}
              required
              class="w-full py-3 px-3 border-2 border-[#ddd] rounded-[10px] text-base box-border transition-[border-color] duration-200 focus:outline-none focus:border-[#667eea]"
            >
              <option value="" disabled selected>Select Deck</option>
              {#each DECKS as deck}
                <option value={deck}>{deck}</option>
              {/each}
            </select>
          </div>
        </div>
      {/each}
    </div>

    <button
      class="w-full py-4 px-4 bg-brand-primary text-white border-none rounded-[10px] text-[1.2rem] font-semibold cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={() => startGame()}
      disabled={participants.some((p) => !p.name || !p.deck)}
    >
      Start Game
    </button>
    <a
      href="/leaderboard"
      class="mt-[15px] block text-center text-brand-primary hover:underline"
    >
      View Leaderboard
    </a>
  </div>
</div>
