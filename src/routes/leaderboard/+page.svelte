<script lang="ts">
  export let data;
</script>

<div class="min-h-screen flex items-center justify-center p-5 font-sans">
  <div class="bg-white rounded-[20px] p-10 max-w-[800px] w-full gap-10">
    <div class="mb-5">
      <a href="/" class="">&larr; Back to Home</a>
    </div>
    <div class="flex flex-col gap-10">
      <div class="flex-1">
        <h2
          class="text-2xl font-bold mb-4 text-brand-primary border-b-2 border-brand-primary pb-2"
        >
          Player Wins
        </h2>
        {#if data.playerStats.length === 0}
          <p class="text-gray-500 italic">No matches recorded yet.</p>
        {:else}
          <ul>
            {#each data.playerStats as player}
              <li
                class="flex justify-between items-center mb-2 pb-2 border-b border-[#ddd] last:border-b-0"
              >
                <span class="font-semibold text-lg">{player.name}</span>
                <span
                  class="bg-brand-primary text-white font-bold py-1 px-3 rounded-full text-sm"
                  >{player.wins}</span
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Player Kills Column -->
      <div class="flex-1">
        <h2
          class="text-2xl font-bold mb-4 text-brand-primary border-b-2 border-brand-primary pb-2"
        >
          Player Kills
        </h2>
        {#if data.killStats.length === 0}
          <p class="text-gray-500 italic">No kills recorded yet.</p>
        {:else}
          <ul>
            {#each data.killStats as player}
              <li
                class="flex justify-between items-center mb-2 pb-2 border-b border-[#ddd] last:border-b-0"
              >
                <span class="font-semibold text-lg">{player.name}</span>
                <span
                  class="bg-brand-primary text-white font-bold py-1 px-3 rounded-full text-sm"
                  >{player.kills}</span
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Deck Wins Column -->
      <div class="flex-1">
        <h2
          class="text-2xl font-bold mb-4 text-brand-primary border-b-2 border-brand-primary pb-2"
        >
          Deck Wins
        </h2>
        {#if data.deckStats.length === 0}
          <p class="text-gray-500 italic">No matches recorded yet.</p>
        {:else}
          <ul>
            {#each data.deckStats as deck}
              <li
                class="flex justify-between items-center mb-2 pb-2 border-b border-[#ddd] last:border-b-0"
              >
                <span class="font-semibold text-lg">{deck.name}</span>
                <span
                  class="bg-brand-primary text-white font-bold py-1 px-3 rounded-full text-sm"
                  >{deck.wins}</span
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</div>
