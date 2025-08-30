export type SongEntity = {
  authors: string; // Song authors, currently separated by ' | ' (TODO)
  ccli?: number; // CCLI id
  content: string; // Song lyrics and chords noted in SongDrive syntax
  createdBy: string; // User id of the creator
  key?: string; // Base key of the song (previously named 'tuning')
  language: string; // Language code
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
  key: string;
};

export type SetlistEntity = {
  createdBy: string; // User id of the creator
  date: string; // Event date of this setlist
  isPublic: boolean; // If true, the setlist is public and readable by everyone
  sharedWith: string[]; // List of user ids with whom this setlist is shared
  songs: SetlistSong[]; // List of song ids and custom keys of songs the setlist contains
  title: string; // Displayed setlist title
};
export type Setlist = {
  id: string;
  entity: SetlistEntity;
  changeNumber?: number;
};
