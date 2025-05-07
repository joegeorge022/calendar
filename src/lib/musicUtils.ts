export interface SongInfo {
  id: string;
  title: string;
  artist: string;
  file: string;
}

export const songs: SongInfo[] = [
  {
    id: "1",
    title: "Cornfield Chase",
    artist: "Hans Zimmer",
    file: "/music/1.mp3"
  },
  {
    id: "2",
    title: "Interlinked",
    artist: "Lonely Lies, GOLDKID$",
    file: "/music/2.mp3"
  },
  {
    id: "3",
    title: "Memory Reboot",
    artist: "VØJ, Narvent",
    file: "/music/3.mp3"
  },
  
];

export const getRandomSong = (): SongInfo => {
  const randomIndex = Math.floor(Math.random() * songs.length);
  return songs[randomIndex];
};

export const getRandomSongExcept = (excludeId: string): SongInfo => {
  if (songs.length === 1) return songs[0];
  
  const availableSongs = songs.filter(song => song.id !== excludeId);
  
  const randomIndex = Math.floor(Math.random() * availableSongs.length);
  return availableSongs[randomIndex];
};

export const getCurrentSong = (): SongInfo => {
  return getRandomSong();
};

export const getSongById = (id: string): SongInfo | undefined => {
  return songs.find(song => song.id === id);
};

export const getSongFilePath = (id: string): string => {
  const song = getSongById(id);
  return song ? song.file : songs[0].file;
}; 