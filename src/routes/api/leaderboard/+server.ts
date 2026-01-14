import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/clients/supabaseServer';

export async function POST({ request }) {
    const body = await request.json();
    const { players, winner, decks_used, winner_deck, player_kills } = body;

    // Validate input
    if (!players || !winner || !decks_used || !winner_deck) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into matches table
    const { error: insertError } = await supabaseServer
        .from('matches')
        .insert([{
            players, // jsonb
            winner,  // text
            decks_used, // jsonb
            winner_deck, // text
            player_kills // jsonb
        }]);
    
    if (insertError) {
        console.error('Error recording match:', insertError);
        return json({ error: insertError.message }, { status: 500 });
    }

    return json({ success: true });
}
