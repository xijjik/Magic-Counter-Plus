import { supabaseServer } from '$lib/clients/supabaseServer';

export async function load() {
    const { data: matches, error } = await supabaseServer
        .from('matches')
        .select('*');

    if (error) {
        console.error('Error fetching matches:', error);
        return { matches: [] };
    }

    return { matches };
}
