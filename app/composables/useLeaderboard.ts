// Fake accounts with points earned per matchday
const players = [
  { name: 'Alex', points: [12, 8, 15, 6, 10] },
  { name: 'Sam', points: [9, 14, 7, 11, 13] },
  { name: 'Jordan', points: [15, 5, 9, 14, 8] },
  { name: 'Casey', points: [6, 11, 12, 9, 7] },
  { name: 'Taylor', points: [10, 9, 8, 13, 12] },
  { name: 'Riley', points: [7, 13, 10, 8, 11] }
]

export const totalMatchdays = 5

// Cumulative standings up to (and including) the given matchday
export function standingsAt(matchday: number) {
  return players
    .map(p => ({
      name: p.name,
      points: p.points.slice(0, matchday).reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ rank: i + 1, ...p }))
}
