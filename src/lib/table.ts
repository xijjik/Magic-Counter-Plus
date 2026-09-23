export const SEAT_COLORS = ["#e3137f", "#6a45f5", "#0a84d6", "#0b9458", "#d46a00", "#e84522"]

export const STARTING_LIFE = 30

interface Seat {
    column: string
    row: string
    rotation: number
}

interface TableLayout {
    columns: string
    rows: string
    seats: Seat[]
}

const seat = (column: string, row: string, rotation: number): Seat => ({ column, row, rotation })

export const TABLE_LAYOUTS: Record<number, TableLayout> = {
    2: { columns: "1fr", rows: "1fr 1fr", seats: [seat("1", "1", 180), seat("1", "2", 0)] },
    3: {
        columns: "1fr 1fr",
        rows: "1fr 1fr",
        seats: [seat("1 / 3", "1", 180), seat("1", "2", 0), seat("2", "2", 0)],
    },
    4: {
        columns: "1fr 1fr",
        rows: "1fr 1fr",
        seats: [seat("1", "1", 180), seat("2", "1", 180), seat("1", "2", 0), seat("2", "2", 0)],
    },
    5: {
        columns: "1fr 1fr",
        rows: "0.3fr 0.35fr 0.35fr",
        seats: [seat("1 / 3", "1", 180), seat("1", "2", 90), seat("2", "2", -90), seat("1", "3", 0), seat("2", "3", 0)],
    },
    6: {
        columns: "1fr 1fr",
        rows: "1fr 1fr 1fr",
        seats: [
            seat("1", "1", 180),
            seat("2", "1", 180),
            seat("1", "2", 90),
            seat("2", "2", -90),
            seat("1", "3", 0),
            seat("2", "3", 0),
        ],
    },
}
