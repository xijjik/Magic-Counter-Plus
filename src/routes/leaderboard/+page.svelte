<script lang="ts">
  export let data;
</script>

<div class="min-h-screen flex items-center justify-center p-5 font-sans">
  <div class="bg-white rounded-[20px] p-10 max-w-[500px] w-full">
    <h1 class="text-2xl font-bold mb-4 text-brand-primary">Leaderboard</h1>
    <ul>
      {#each data.players as player}
        <li class="mb-2 pb-2 border-b border-[#ddd] last:border-b-0">
          {player.players}: {player.wins}
        </li>
      {/each}
    </ul>
  </div>
</div>
