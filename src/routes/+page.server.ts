
import { PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const authenticated = cookies.get('mtg_auth') === 'true';
	return {
		authenticated
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (password !== PASSWORD) {
			return fail(400, { incorrect: true });
		}

		cookies.set('mtg_auth', 'true', {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		return { success: true };
	}
};
