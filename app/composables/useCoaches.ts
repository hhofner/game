export interface Coach {
  name: string
  image: string
}

// 20 famous soccer coaches (photos from Wikimedia Commons)
export const coaches: Coach[] = [
  { name: 'Pep Guardiola', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg/250px-Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg' },
  { name: 'Jürgen Klopp', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_04.jpg/250px-J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_04.jpg' },
  { name: 'Carlo Ancelotti', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/26.01.2026_-_Reuni%C3%A3o_com_o_Presidente_da_Federa%C3%A7%C3%A3o_Internacional_de_Futebol_%28FIFA%29%2C_Gianni_Infantino_-_55062589679_%28Carlo_Ancelotti%29_%28cropped%29.jpg/250px-26.01.2026_-_Reuni%C3%A3o_com_o_Presidente_da_Federa%C3%A7%C3%A3o_Internacional_de_Futebol_%28FIFA%29%2C_Gianni_Infantino_-_55062589679_%28Carlo_Ancelotti%29_%28cropped%29.jpg' },
  { name: 'José Mourinho', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jos%C3%A9_Mourinho_20250206_%281%29.jpg/250px-Jos%C3%A9_Mourinho_20250206_%281%29.jpg' },
  { name: 'Zinedine Zidane', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg/250px-Zinedine_Zidane_by_Tasnim_03.jpg' },
  { name: 'Diego Simeone', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Diego_Simeone_-_240422_192621-2_%28cropped%29.jpg/250px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Diego_Simeone_-_240422_192621-2_%28cropped%29.jpg' },
  { name: 'Antonio Conte', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/20150616_Antonio_Conte.jpg/250px-20150616_Antonio_Conte.jpg' },
  { name: 'Thomas Tuchel', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93175.jpg/250px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93175.jpg' },
  { name: 'Mikel Arteta', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Mikel_Arteta_2021_%28cropped%29.png/250px-Mikel_Arteta_2021_%28cropped%29.png' },
  { name: 'Hansi Flick', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/2022_Hansi_Flick_%28cropped%29.jpg/250px-2022_Hansi_Flick_%28cropped%29.jpg' },
  { name: 'Luis Enrique', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Luis_Enrique_2014.jpg/250px-Luis_Enrique_2014.jpg' },
  { name: 'Roberto Mancini', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Roberto_Mancini_Saudi_Arabia-South_Korea_match_2023_AFC_Asian_Cup.jpg/250px-Roberto_Mancini_Saudi_Arabia-South_Korea_match_2023_AFC_Asian_Cup.jpg' },
  { name: 'Didier Deschamps', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Didier_Deschamps_in_2018.jpg/250px-Didier_Deschamps_in_2018.jpg' },
  { name: 'Lionel Scaloni', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Lionel_Scaloni_-_2022.jpg' },
  { name: 'Alex Ferguson', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/17.10.2010_Gira_Europa_%285093568820%29_%28Alex_Ferguson%29.jpg/250px-17.10.2010_Gira_Europa_%285093568820%29_%28Alex_Ferguson%29.jpg' },
  { name: 'Arsène Wenger', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Ars%C3%A8ne_Wenger_-_240422_192850_%28cropped%29.jpg/250px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Ars%C3%A8ne_Wenger_-_240422_192850_%28cropped%29.jpg' },
  { name: 'Marcelo Bielsa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Marcelo_Bielsa_2018_%28cropped%29.jpg/250px-Marcelo_Bielsa_2018_%28cropped%29.jpg' },
  { name: 'Erik ten Hag', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/%D0%9E%D1%82%D0%BA%D1%80%D1%8B%D1%82%D0%B0%D1%8F_%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%C2%AB%D0%90%D1%8F%D0%BA%D1%81%D0%B0%C2%BB_%D0%BF%D0%B5%D1%80%D0%B5%D0%B4_%D0%BC%D0%B0%D1%82%D1%87%D0%B5%D0%BC_%D1%81_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB._27_%D0%B0%D0%B2%D0%B3%D1%83%D1%81%D1%82%D0%B0_2018_%D0%B3%D0%BE%D0%B4%D0%B0_%E2%80%94_900304_%28Erik_ten_Hag%29.jpg/250px-%D0%9E%D1%82%D0%BA%D1%80%D1%8B%D1%82%D0%B0%D1%8F_%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%C2%AB%D0%90%D1%8F%D0%BA%D1%81%D0%B0%C2%BB_%D0%BF%D0%B5%D1%80%D0%B5%D0%B4_%D0%BC%D0%B0%D1%82%D1%87%D0%B5%D0%BC_%D1%81_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB._27_%D0%B0%D0%B2%D0%B3%D1%83%D1%81%D1%82%D0%B0_2018_%D0%B3%D0%BE%D0%B4%D0%B0_%E2%80%94_900304_%28Erik_ten_Hag%29.jpg' },
  { name: 'Unai Emery', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Unai_Emery_-_Sevilla_%28cropped%29.jpg/250px-Unai_Emery_-_Sevilla_%28cropped%29.jpg' },
  { name: 'Julian Nagelsmann', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Julian_Nagelsmann.jpg/250px-Julian_Nagelsmann.jpg' }
]

export function useCoaches() {
  return { coaches }
}
