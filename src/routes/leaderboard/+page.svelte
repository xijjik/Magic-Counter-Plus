<script lang="ts">
  export let data;
</script>

<div class="min-h-screen flex items-center justify-center p-5 font-sans">
  <div class="bg-white rounded-[20px] p-10 max-w-[500px] w-full">
    <h1>Leaderboard</h1>
    <ul>
      {#each data.players as player}
        <li>{player.players} - {player.wins}</li>
      {/each}
    </ul>
  </div>
</div>
