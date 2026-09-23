# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A private Magic: The Gathering Commander playgroup of about ten regulars (the roster in `src/lib/constants.ts`). They play 2–6 player pods around one table, with a single phone or tablet lying flat in the middle that everyone reaches over.

## Product Purpose

Run the game night: pick who is playing which deck, track life totals during the game, roll for who goes first, crown the winner and record kills. Every finished match goes to Supabase and feeds a shared leaderboard, recent matches and per-player stats. Success means the counter never gets in the way at the table, and the group gets bragging rights afterwards.

## Positioning

Built for this one group: their names, their decks and their history. It isn't a generic life counter. Its value is the persistent record of who beat whom with what.

## Operating Context

- Setup happens on the same device just before a game, choosing from fixed player and deck lists.
- During play the device lies flat and each seat's panel is rotated to face that player, with the layout depending on player count.
- Life starts at 30. Adjustments are rapid single taps.
- After the game, the winner and per-player kills are entered in a dialog and posted to `/api/leaderboard`.
- Stats pages are browsed casually, often on phones, between or after games.
- Installed as a home-screen PWA (`static/manifest.json`).

## Capabilities and Constraints

- SvelteKit 2 + Svelte 5, Tailwind v4, Lucide icons, Supabase, deployed on Vercel.
- A shared password (cookie `mtg_auth`) gates setup and the game. The stats pages are public.
- Player and deck lists are hard-coded constants.
- The match record holds players, winner, decks_used, winner_deck, player_kills and game_date.

## Brand Commitments

- The user has set the look: a white and grey light theme with a vibrant pink highlight.
- The game screen may go beyond that palette but should keep its vibe (bold, colourful seat panels, big numbers).
- The user chose a conventional, category-standard app look on purpose (not a themed world). They named no reference products, so the working quality bar is Linear/Vercel precision for the app screens and Apple Fitness-style bold numerals for the stats.

## Evidence on Hand

Real match history lives in Supabase. The repo has no logos or brand assets beyond the PWA icons.

## Product Principles

1. The table comes first: during play, every control has to be readable and hittable upside down from across a table.
2. It's the group's own record: names, decks and history are the content, so they get pride of place.
3. Keep setup short. Getting from opening the app to the first turn should take a few taps.
