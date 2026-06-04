export interface Player {
  id: number
  name: string
  avatar: string
  flag: string
  nation: string
  position: string
  club: string
  goals: number
  assists: number
  apps: number
}

// Player pool with extra info shown in the detail half-sheet
const players: Player[] = [
  { id: 1, name: 'A. Rodríguez', avatar: 'https://i.pravatar.cc/120?img=12', flag: 'es', nation: 'Spain', position: 'Forward', club: 'Madrid', goals: 7, assists: 3, apps: 12 },
  { id: 2, name: 'K. Müller', avatar: 'https://i.pravatar.cc/120?img=33', flag: 'de', nation: 'Germany', position: 'Midfielder', club: 'Munich', goals: 4, assists: 6, apps: 12 },
  { id: 3, name: 'L. Costa', avatar: 'https://i.pravatar.cc/120?img=14', flag: 'br', nation: 'Brazil', position: 'Forward', club: 'Rio', goals: 9, assists: 2, apps: 11 },
  { id: 4, name: 'M. Fernández', avatar: 'https://i.pravatar.cc/120?img=8', flag: 'ar', nation: 'Argentina', position: 'Midfielder', club: 'Buenos Aires', goals: 3, assists: 5, apps: 12 },
  { id: 5, name: 'J. Silva', avatar: 'https://i.pravatar.cc/120?img=51', flag: 'pt', nation: 'Portugal', position: 'Defender', club: 'Lisbon', goals: 1, assists: 1, apps: 10 },
  { id: 6, name: 'T. Rossi', avatar: 'https://i.pravatar.cc/120?img=60', flag: 'it', nation: 'Italy', position: 'Defender', club: 'Milan', goals: 0, assists: 2, apps: 12 },
  { id: 7, name: 'H. Carter', avatar: 'https://i.pravatar.cc/120?img=15', flag: 'gb-eng', nation: 'England', position: 'Forward', club: 'London', goals: 6, assists: 4, apps: 11 },
  { id: 8, name: 'P. Dubois', avatar: 'https://i.pravatar.cc/120?img=11', flag: 'fr', nation: 'France', position: 'Goalkeeper', club: 'Paris', goals: 0, assists: 0, apps: 12 }
]

export function usePlayers() {
  return { players }
}
