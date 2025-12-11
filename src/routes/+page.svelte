<script lang="ts">
  import { goto } from "$app/navigation";
  import { dev } from "$app/environment";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";

  injectAnalytics({ mode: dev ? "development" : "production" });

  let playerCount = $state(4);
  let playerNames: string[] = $state([]);

  $effect(() => {
    if (playerNames.length < playerCount) {
      while (playerNames.length < playerCount) {
        playerNames.push("");
      }
    } else if (playerNames.length > playerCount) {
      playerNames = playerNames.slice(0, playerCount);
    }
  });

  function startGame() {
    const names = playerNames.map((n) => n.trim()).filter((n) => n);
    if (names.length >= 2) {
      const params = new URLSearchParams();
      names.forEach((name) => params.append("player", name));
      goto(`/game?${params.toString()}`);
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-5 font-sans">
  <div class="bg-white rounded-[20px] p-10 max-w-[500px] w-full">
    <div class="mb-[30px]">
      <label
        for="player-count"
        class="block mb-[10px] font-semibold text-[#555]"
        >Number of Players:</label
      >
      <div class="flex gap-[10px]">
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
      {#each playerNames as name, i}
        <div>
          <label
            for="player-{i}"
            class="block mb-[5px] font-semibold text-black"
            >Player {i + 1}:</label
          >
          <input
            id="player-{i}"
            type="text"
            bind:value={playerNames[i]}
            required
            minlength="3"
            maxlength="3"
            placeholder="Player {i + 1}"
            class="uppercase w-full py-3 px-3 border-2 border-[#ddd] rounded-[10px] text-base box-border transition-[border-color] duration-200 focus:outline-none focus:border-[#667eea]"
          />
        </div>
      {/each}
    </div>

    <button
      class="w-full py-4 px-4 bg-brand-primary text-white border-none rounded-[10px] text-[1.2rem] font-semibold cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(102,126,234,0.4)] active:translate-y-0"
      onclick={() => startGame()}
    >
      Start Game
    </button>
  </div>
</div>
