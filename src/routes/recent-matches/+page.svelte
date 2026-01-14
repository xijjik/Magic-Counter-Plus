<script lang="ts">
  import { fade } from "svelte/transition";

  export let data;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="min-h-screen bg-gray-100 p-8 font-sans">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Recent Matches</h1>
      <a
        href="/"
        class="bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
      >
        Back to Home
      </a>
    </div>

    <div class="bg-white rounded-[20px] shadow-lg overflow-hidden">
      {#if data.matches.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="p-6 font-semibold text-gray-600">Date</th>
                <th class="p-6 font-semibold text-gray-600">Players</th>
                <th class="p-6 font-semibold text-gray-600">Winner</th>
                <th class="p-6 font-semibold text-gray-600">Winning Deck</th>
              </tr>
            </thead>
            <tbody>
              {#each data.matches as match, i}
                <tr
                  class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  in:fade={{ delay: i * 50 }}
                >
                  <td class="p-6 text-gray-700 whitespace-nowrap">
                    {formatDate(match.game_date)}
                  </td>
                  <td class="p-6 text-gray-700">
                    <div class="flex flex-wrap gap-2">
                      {#each match.players as player}
                        <span
                          class="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600"
                        >
                          {player}
                        </span>
                      {/each}
                    </div>
                  </td>
                  <td class="p-6">
                    <span class="font-bold text-brand-primary">
                      {match.winner}
                    </span>
                  </td>
                  <td class="p-6 text-gray-700">
                    {match.winner_deck}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="p-10 text-center text-gray-500">
          No matches recorded yet.
        </div>
      {/if}
    </div>
  </div>
</div>
