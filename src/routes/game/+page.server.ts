
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const authenticated = cookies.get('mtg_auth') === 'true';

	if (!authenticated) {
		throw redirect(303, '/');
	}
};
