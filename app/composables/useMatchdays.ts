export interface MatchdayPick {
  name: string
  flag: string
  points: number
}

export interface MatchdayGame {
  home: { name: string, flag: string }
  away: { name: string, flag: string }
}

export interface Matchday {
  number: number
  finished: boolean
  challenge: { name: string, criteria: string[] }
  games: MatchdayGame[]
  picks: MatchdayPick[]
}

const matchdays: Matchday[] = [
  {
    number: 1,
    finished: true,
    challenge: {
      name: 'Group Stage Openers',
      criteria: ['Pick players from this matchday\'s fixtures', 'At least one forward', 'Goals are worth double']
    },
    games: [
      { home: { name: 'France', flag: 'fr' }, away: { name: 'Germany', flag: 'de' } },
      { home: { name: 'Brazil', flag: 'br' }, away: { name: 'Argentina', flag: 'ar' } },
      { home: { name: 'Spain', flag: 'es' }, away: { name: 'Portugal', flag: 'pt' } }
    ],
    picks: [
      { name: 'A. Rodríguez', flag: 'es', points: 5 },
      { name: 'K. Müller', flag: 'de', points: 4 },
      { name: 'L. Costa', flag: 'br', points: 2 }
    ]
  },
  {
    number: 2,
    finished: true,
    challenge: {
      name: 'Midfield Masters',
      criteria: ['Midfielders earn bonus points', 'Assists count double', 'Pick from Group C or D']
    },
    games: [
      { home: { name: 'England', flag: 'gb-eng' }, away: { name: 'Italy', flag: 'it' } },
      { home: { name: 'Netherlands', flag: 'nl' }, away: { name: 'Belgium', flag: 'be' } },
      { home: { name: 'Croatia', flag: 'hr' }, away: { name: 'Japan', flag: 'jp' } }
    ],
    picks: [
      { name: 'M. Fernández', flag: 'ar', points: 6 },
      { name: 'H. Carter', flag: 'gb-eng', points: 3 },
      { name: 'J. Silva', flag: 'pt', points: 1 }
    ]
  },
  {
    number: 3,
    finished: true,
    challenge: {
      name: 'Defensive Wall',
      criteria: ['Defenders and goalkeepers earn bonus', 'Clean sheets worth triple', 'No bonus for forwards']
    },
    games: [
      { home: { name: 'Germany', flag: 'de' }, away: { name: 'Spain', flag: 'es' } },
      { home: { name: 'Argentina', flag: 'ar' }, away: { name: 'Brazil', flag: 'br' } },
      { home: { name: 'Portugal', flag: 'pt' }, away: { name: 'France', flag: 'fr' } }
    ],
    picks: [
      { name: 'A. Rodríguez', flag: 'es', points: 4 },
      { name: 'P. Dubois', flag: 'fr', points: 3 },
      { name: 'T. Rossi', flag: 'it', points: 2 }
    ]
  },
  {
    number: 4,
    finished: true,
    challenge: {
      name: 'Knockout: Round of 16',
      criteria: ['Players must feature in a knockout tie', 'Goals and assists count', 'Win-or-go-home multiplier']
    },
    games: [
      { home: { name: 'France', flag: 'fr' }, away: { name: 'Belgium', flag: 'be' } },
      { home: { name: 'Brazil', flag: 'br' }, away: { name: 'Portugal', flag: 'pt' } }
    ],
    picks: [
      { name: 'L. Costa', flag: 'br', points: 5 },
      { name: 'K. Müller', flag: 'de', points: 4 },
      { name: 'H. Carter', flag: 'gb-eng', points: 3 }
    ]
  },
  {
    number: 5,
    finished: false,
    challenge: {
      name: 'Quarter-finals',
      criteria: ['Players in the quarter-final ties', 'Higher points on offer', 'Pick your in-form stars']
    },
    games: [
      { home: { name: 'Spain', flag: 'es' }, away: { name: 'Germany', flag: 'de' } },
      { home: { name: 'Argentina', flag: 'ar' }, away: { name: 'England', flag: 'gb-eng' } }
    ],
    picks: [
      { name: 'A. Rodríguez', flag: 'es', points: 0 },
      { name: 'L. Costa', flag: 'br', points: 0 },
      { name: 'M. Fernández', flag: 'ar', points: 0 }
    ]
  }
]

export function useMatchdays() {
  return { matchdays }
}
