<script lang="ts">
    import "./layout.css"
    import favicon from "$lib/assets/favicon.svg"
    import { page } from "$app/state"
    import { Swords, Trophy, History, UserRound } from "@lucide/svelte"

    let { children } = $props()

    const NAV = [
        { href: "/", label: "Play", icon: Swords },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/recent-matches", label: "Matches", icon: History },
        { href: "/player-stats", label: "Players", icon: UserRound },
    ]

    let isGame = $derived(page.url.pathname.startsWith("/game"))
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>MTG Counter</title>
</svelte:head>

{#if isGame}
    {@render children()}
{:else}
    <div class="min-h-dvh">
        <header class="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
            <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
                <a href="/" class="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-ink">
                    <img src={favicon} alt="" class="size-7" />
                    <span class="text-[1.0625rem]">MTG Counter</span>
                </a>
                <nav aria-label="Main" class="hidden md:block">
                    <ul class="flex gap-1">
                        {#each NAV as item}
                            {@const active = page.url.pathname === item.href}
                            <li>
                                <a
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    class="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors {active
                                        ? 'bg-surface text-ink shadow-panel'
                                        : 'text-ink-2 hover:bg-sunken hover:text-ink'}"
                                >
                                    <item.icon class="size-4 {active ? 'text-pink' : 'text-ink-3'}" />
                                    {item.label}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:px-6 sm:pt-12 md:pb-20">
            {@render children()}
        </main>

        <nav
            aria-label="Main"
            class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
            <ul class="grid grid-cols-4">
                {#each NAV as item}
                    {@const active = page.url.pathname === item.href}
                    <li>
                        <a
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            class="flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium {active
                                ? 'text-pink'
                                : 'text-ink-3'}"
                        >
                            <item.icon class="size-5" strokeWidth={active ? 2.25 : 1.75} />
                            {item.label}
                        </a>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
{/if}
