import { DECKS } from "./constants"

export interface Match {
    game_date: string
    players: string[]
    decks_used: string[] | null
    winner: string
    winner_deck: string | null
    player_kills: Record<string, number> | null
}

export interface Fact {
    title: string
    value: string | number
    subject?: string
    detail: string
}

interface PlayerTally {
    name: string
    games: number
    wins: number
    kills: number
    expectedWins: number
    decks: Map<string, number>
    longestStreak: number
    currentStreak: number
    gamesSinceWin: number
}

interface DeckTally {
    name: string
    games: number
    wins: number
}

interface Context {
    matches: Match[]
    players: PlayerTally[]
    decks: DeckTally[]
    beats: Map<string, Map<string, number>>
    shared: Map<string, number>
}

const MIN_GAMES = 3

const pct = (n: number) => `${Math.round(n * 100)}%`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
const pairKey = (a: string, b: string) => [a, b].sort().join("|")
const killsOf = (m: Match, name: string) => Number(m.player_kills?.[name]) || 0
const increment = <K>(map: Map<K, number>, key: K, by = 1) => map.set(key, (map.get(key) ?? 0) + by)
const top = <T>(items: T[], score: (item: T) => number): T | undefined =>
    items.reduce<T | undefined>((best, item) => (best === undefined || score(item) > score(best) ? item : best), undefined)

const winnersOf = (matches: Match[]) => {
    const wins = new Map<string, number>()
    matches.forEach((m) => increment(wins, m.winner))
    return [...wins].map(([name, count]) => ({ name, count }))
}

function buildContext(raw: Match[]): Context {
    const matches = raw
        .filter((m) => Array.isArray(m.players) && m.players.length >= 2 && m.winner)
        .toSorted((a, b) => a.game_date.localeCompare(b.game_date))
    const players = new Map<string, PlayerTally>()
    const decks = new Map<string, DeckTally>()
    const beats = new Map<string, Map<string, number>>()
    const shared = new Map<string, number>()

    for (const m of matches) {
        const chance = 1 / m.players.length
        m.players.forEach((name, seat) => {
            const isWin = name === m.winner
            const p = players.get(name) ?? {
                name, games: 0, wins: 0, kills: 0, expectedWins: 0, decks: new Map(),
                longestStreak: 0, currentStreak: 0, gamesSinceWin: 0,
            }
            p.games++
            p.wins += isWin ? 1 : 0
            p.kills += killsOf(m, name)
            p.expectedWins += chance
            p.currentStreak = isWin ? p.currentStreak + 1 : 0
            p.longestStreak = Math.max(p.longestStreak, p.currentStreak)
            p.gamesSinceWin = isWin ? 0 : p.gamesSinceWin + 1
            players.set(name, p)

            const deck = m.decks_used?.[seat]
            if (!deck) return
            increment(p.decks, deck)
            const d = decks.get(deck) ?? { name: deck, games: 0, wins: 0 }
            d.games++
            d.wins += isWin ? 1 : 0
            decks.set(deck, d)
        })

        const winnerBeats = beats.get(m.winner) ?? new Map<string, number>()
        m.players.filter((name) => name !== m.winner).forEach((loser) => increment(winnerBeats, loser))
        beats.set(m.winner, winnerBeats)

        m.players.forEach((a, i) => m.players.slice(i + 1).forEach((b) => increment(shared, pairKey(a, b))))
    }

    return {
        matches,
        players: [...players.values()].toSorted((a, b) => b.games - a.games),
        decks: [...decks.values()],
        beats,
        shared,
    }
}

const regulars = (ctx: Context) => ctx.players.filter((p) => p.games >= MIN_GAMES)

function beatingTheOdds(ctx: Context): Fact | null {
    const p = top(regulars(ctx), (p) => p.wins - p.expectedWins)
    if (!p || p.wins <= p.expectedWins) return null
    return {
        title: "Beating the odds",
        value: `+${(p.wins - p.expectedWins).toFixed(1)}`,
        subject: p.name,
        detail: `wins above chance. ${plural(p.wins, "win")} from ${plural(p.games, "game")}, where luck alone says ${p.expectedWins.toFixed(1)}.`,
    }
}

function owedAWin(ctx: Context): Fact | null {
    const p = top(regulars(ctx), (p) => p.expectedWins - p.wins)
    if (!p || p.wins >= p.expectedWins) return null
    return {
        title: "The dice owe them",
        value: `−${(p.expectedWins - p.wins).toFixed(1)}`,
        subject: p.name,
        detail: `wins below chance. ${plural(p.wins, "win")} from ${plural(p.games, "game")}, where luck alone says ${p.expectedWins.toFixed(1)}.`,
    }
}

function biggestRivalry(ctx: Context): Fact | null {
    const pairs = [...ctx.beats].flatMap(([winner, losers]) =>
        [...losers].map(([loser, count]) => ({ winner, loser, count })),
    )
    const r = top(pairs, (r) => r.count)
    if (!r || r.count < 2) return null
    return {
        title: "Nemesis",
        value: `${r.count}×`,
        subject: `${r.winner} over ${r.loser}`,
        detail: `${r.winner} has won ${r.count} of the ${ctx.shared.get(pairKey(r.winner, r.loser))} games they've both played.`,
    }
}

function kingmaker(ctx: Context): Fact | null {
    const p = top(
        regulars(ctx).filter((p) => p.wins < p.expectedWins && p.kills > 0),
        (p) => p.kills / p.games,
    )
    if (!p) return null
    return {
        title: "Kingmaker",
        value: (p.kills / p.games).toFixed(1),
        subject: p.name,
        detail: `kills a game, yet only ${plural(p.wins, "win")}. Someone else is cashing in.`,
    }
}

function pacifist(ctx: Context): Fact | null {
    const p = top(winnersOf(ctx.matches.filter((m) => m.player_kills && killsOf(m, m.winner) === 0)), (w) => w.count)
    if (!p) return null
    return {
        title: "Pacifist",
        value: p.count,
        subject: p.name,
        detail: `${p.count === 1 ? "win" : "wins"} without logging a single kill.`,
    }
}

function longestStreak(ctx: Context): Fact | null {
    const p = top(ctx.players, (p) => p.longestStreak)
    if (!p || p.longestStreak < 2) return null
    return { title: "Longest win streak", value: p.longestStreak, subject: p.name, detail: "wins in a row. The group record." }
}

function onFire(ctx: Context): Fact | null {
    const p = top(ctx.players, (p) => p.currentStreak)
    if (!p || p.currentStreak < 2) return null
    return { title: "On fire", value: p.currentStreak, subject: p.name, detail: "wins in a row and counting. Someone stop them." }
}

function drought(ctx: Context): Fact | null {
    const p = top(ctx.players, (p) => p.gamesSinceWin)
    if (!p || p.gamesSinceWin < MIN_GAMES) return null
    return {
        title: "Longest drought",
        value: p.gamesSinceWin,
        subject: p.name,
        detail: p.wins ? "games since their last win." : "games and still waiting on the first win.",
    }
}

function deckVerdicts(ctx: Context) {
    const tested = ctx.decks.filter((d) => d.games >= MIN_GAMES)
    const best = top(tested, (d) => d.wins / d.games + d.games / 1e6)
    const worst = top(tested, (d) => -d.wins / d.games + d.games / 1e6)
    return { best, worst }
}

function topDeck(ctx: Context): Fact | null {
    const { best } = deckVerdicts(ctx)
    if (!best || !best.wins) return null
    return {
        title: "Best deck",
        value: pct(best.wins / best.games),
        subject: best.name,
        detail: `win rate. ${plural(best.wins, "win")} from ${plural(best.games, "game")}.`,
    }
}

function trapDeck(ctx: Context): Fact | null {
    const { best, worst } = deckVerdicts(ctx)
    if (!best || !worst || worst.wins / worst.games >= best.wins / best.games) return null
    return {
        title: "Trap deck",
        value: pct(worst.wins / worst.games),
        subject: worst.name,
        detail: `win rate across ${plural(worst.games, "game")}. Bold choice to keep shuffling it up.`,
    }
}

function gatheringDust(ctx: Context): Fact | null {
    const played = new Set(ctx.decks.map((d) => d.name))
    const unplayed = DECKS.filter((d) => !played.has(d))
    if (!unplayed.length) return null
    const named = unplayed.slice(0, 3).join(", ")
    const rest = unplayed.length - 3
    return {
        title: "Gathering dust",
        value: unplayed.length,
        subject: "decks never played",
        detail: rest > 0 ? `${named} and ${rest} more.` : `${named}.`,
    }
}

function deckTourist(ctx: Context): Fact | null {
    const p = top(ctx.players, (p) => p.decks.size)
    if (!p || p.decks.size < 2) return null
    return {
        title: "Deck tourist",
        value: p.decks.size,
        subject: p.name,
        detail: `different decks across ${plural(p.games, "game")}. Commitment issues.`,
    }
}

function loyalist(ctx: Context): Fact | null {
    const candidates = regulars(ctx).flatMap((p) => {
        const fav = top([...p.decks], ([, count]) => count)
        return fav ? [{ name: p.name, deck: fav[0], share: fav[1] / p.games }] : []
    })
    const p = top(candidates, (c) => c.share)
    if (!p) return null
    return { title: "Loyalist", value: pct(p.share), subject: p.name, detail: `of their games are with ${p.deck}.` }
}

function bloodbath(ctx: Context): Fact | null {
    const performances = ctx.matches.flatMap((m) =>
        m.players.map((name, i) => ({ name, kills: killsOf(m, name), deck: m.decks_used?.[i] })),
    )
    const p = top(performances, (p) => p.kills)
    if (!p || p.kills < 2) return null
    return {
        title: "Bloodbath",
        value: p.kills,
        subject: p.name,
        detail: `kills in a single game${p.deck ? `, piloting ${p.deck}` : ""}.`,
    }
}

function giantSlayer(ctx: Context): Fact | null {
    const leader = top(ctx.players, (p) => p.wins)
    if (!leader) return null
    const slayers = [...ctx.beats]
        .filter(([name]) => name !== leader.name)
        .map(([name, losers]) => ({ name, count: losers.get(leader.name) ?? 0 }))
    const p = top(slayers, (s) => s.count)
    if (!p || !p.count) return null
    return {
        title: "Giant slayer",
        value: p.count,
        subject: p.name,
        detail: `wins over ${leader.name}, the player with the most wins. Somebody has to.`,
    }
}

function signatureCombo(ctx: Context): Fact | null {
    const combos = new Map<string, { name: string; deck: string; wins: number }>()
    ctx.matches.forEach((m) => {
        const deck = m.decks_used?.[m.players.indexOf(m.winner)]
        if (!deck) return
        const key = `${m.winner}|${deck}`
        const c = combos.get(key) ?? { name: m.winner, deck, wins: 0 }
        combos.set(key, { ...c, wins: c.wins + 1 })
    })
    const c = top([...combos.values()], (c) => c.wins)
    if (!c || c.wins < 2) return null
    return { title: "Signature combo", value: c.wins, subject: c.name, detail: `wins piloting ${c.deck}. The most by any player-deck pair.` }
}

function assassin(ctx: Context): Fact | null {
    const p = top(regulars(ctx), (p) => p.kills / p.games)
    if (!p || !p.kills) return null
    return {
        title: "Assassin",
        value: (p.kills / p.games).toFixed(1),
        subject: p.name,
        detail: `kills per game across ${plural(p.games, "game")}. Watch your back.`,
    }
}

function crowdFavourite(ctx: Context): Fact | null {
    const d = top(ctx.decks, (d) => d.games)
    if (!d || d.games < 2) return null
    return {
        title: "Crowd favourite",
        value: d.games,
        subject: d.name,
        detail: `games played, the most of any deck. ${plural(d.wins, "win")} to show for it.`,
    }
}

const FACTS = [
    beatingTheOdds,
    biggestRivalry,
    onFire,
    kingmaker,
    topDeck,
    longestStreak,
    pacifist,
    trapDeck,
    giantSlayer,
    signatureCombo,
    loyalist,
    deckTourist,
    assassin,
    crowdFavourite,
    bloodbath,
    drought,
    owedAWin,
    gatheringDust,
]

export function computeFunStats(raw: Match[]) {
    const ctx = buildContext(raw)
    const names = ctx.players.map((p) => p.name)
    const headToHead = names.map((a) => names.map((b) => (a === b ? null : (ctx.beats.get(a)?.get(b) ?? 0))))

    return {
        totals: {
            games: ctx.matches.length,
            kills: ctx.players.reduce((sum, p) => sum + p.kills, 0),
            players: ctx.players.length,
            decks: ctx.decks.length,
        },
        facts: FACTS.map((fact) => fact(ctx)).filter((fact): fact is Fact => fact !== null),
        headToHead: { names, rows: headToHead, max: Math.max(1, ...headToHead.flat().map((v) => v ?? 0)) },
    }
}
