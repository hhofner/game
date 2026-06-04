// Fake accounts with avatar + points earned per matchday.
// `isYou` marks the current user, whose avatar is sourced from useProfile().
const players = [
  { name: 'Alex', avatar: 'https://i.pravatar.cc/80?img=12', points: [12, 8, 15, 6, 10] },
  { name: 'Sam', avatar: 'https://i.pravatar.cc/80?img=32', points: [9, 14, 7, 11, 13] },
  { name: 'Jordan', avatar: 'https://i.pravatar.cc/80?img=15', points: [15, 5, 9, 14, 8] },
  { name: 'Casey', avatar: 'https://i.pravatar.cc/80?img=45', points: [6, 11, 12, 9, 7] },
  { name: 'Taylor', avatar: 'https://i.pravatar.cc/80?img=24', points: [10, 9, 8, 13, 12] },
  { name: 'Riley', avatar: 'https://i.pravatar.cc/80?img=58', points: [7, 13, 10, 8, 11] },
  { name: 'You', isYou: true, avatar: '', points: [11, 10, 9, 12, 10] }
]

export const totalMatchdays = 5

// How many matchdays have finished (the rest are upcoming)
export const finishedMatchdays = 4

// The current user's points earned per matchday
export function yourPoints() {
  return players.find(p => p.isYou)?.points ?? []
}

// Medal colors for the top 3 (gold / silver / bronze)
export function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-yellow-400 text-yellow-950'
  if (rank === 2) return 'bg-gray-300 text-gray-800'
  if (rank === 3) return 'bg-amber-600 text-white'
  return 'bg-elevated text-muted'
}

// Subtle row tint for the top 3
export function rankRowClass(rank: number) {
  if (rank === 1) return 'bg-yellow-400/10'
  if (rank === 2) return 'bg-gray-400/10'
  if (rank === 3) return 'bg-amber-600/10'
  return ''
}

// Cumulative standings up to (and including) the given matchday
export function standingsAt(matchday: number) {
  return players
    .map(p => ({
      name: p.name,
      avatar: p.avatar,
      isYou: p.isYou ?? false,
      points: p.points.slice(0, matchday).reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ rank: i + 1, ...p }))
}
