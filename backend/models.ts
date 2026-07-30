export type SongEntity = {
  authors: string[]; // Song authors
  ccli?: number; // CCLI id
  content: string; // Song lyrics and chords noted in SongDrive syntax
  createdBy: string; // User id of the creator (new)
  key?: string; // Base key of the song (previously named 'tuning')
  language: string; // Language code, two letter iso
  publisher: string; // Song publisher information
  slug: string; // Unique song url slug (previously named 'id')
  subtitle?: string; // Displayed song subtitle
  tags: string[]; // List of content tags
  title: string; // Displayed song title
  translations: string[]; // List of song ids that are the same song in another language
  year?: number; // Year when the song was created
  youtube?: string; // YouTube slug
};
export type Song = {
  id: string;
  entity: SongEntity;
  changeNumber?: number;
};

export type SetlistSong = {
  id: string;
  key: string; // Custom key (previously named 'tuning')
};

export type SetlistEntity = {
  active: boolean; // If true, the setlist is currently syncing positions
  createdBy: string; // User id of the creator (previously named 'creator')
  date: string; // Event date of this setlist in iso format YYYY-MM-DD
  isPublic: boolean; // If true, the setlist is public and readable by everyone (inverted, previously named 'private')
  position: number; // Current slide position when in presentation mode
  sharedWith: string[]; // List of user ids with whom this setlist is shared
  slug: string; // Unique setlist url slug (previously named 'id')
  songs: SetlistSong[]; // List of song ids and custom keys of songs the setlist contains
  title: string; // Displayed setlist title
};
export type Setlist = {
  id: string;
  entity: SetlistEntity;
  changeNumber?: number;
};
