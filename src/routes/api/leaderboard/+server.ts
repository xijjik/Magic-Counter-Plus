import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/clients/supabaseServer';

export async function POST({ request }) {
    const body = await request.json();
    const playerName = body.players;
    const winsToAdd = body.wins || 1;

    if (!playerName) {
        return json({ error: 'Player name is required' }, { status: 400 });
    }

    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabaseServer
        .from('leaderboard')
        .select('*')
        .eq('players', playerName)
        .maybeSingle();

    if (fetchError) {
        console.error('Error fetching player:', fetchError);
        return json({ error: fetchError.message }, { status: 500 });
    }

    if (existingPlayer) {
        // Player exists, update wins
        const newWins = (existingPlayer.wins || 0) + winsToAdd;
        const { error: updateError } = await supabaseServer
            .from('leaderboard')
            .update({ wins: newWins })
            .eq('players', playerName);
        
        if (updateError) {
            console.error('Error updating player:', updateError);
            return json({ error: updateError.message }, { status: 500 });
        }
    } else {
        // Player does not exist, create new
        const { error: insertError } = await supabaseServer
            .from('leaderboard')
            .insert([{ players: playerName, wins: winsToAdd }]);
        
        if (insertError) {
            console.error('Error creating player:', insertError);
            return json({ error: insertError.message }, { status: 500 });
        }
    }

    return json({ success: true });
}
