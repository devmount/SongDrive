import type { SongEntity, SetlistEntity, SetlistSong } from '@backend/models';
import type { UserRole } from '@backend/definitions';

/**
 * Amberbase's authenticated user combined with SongDrive's role model.
 */
export type AppUser = {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
  photo: null;
};

/**
 * A single parsed part of a song's content (verse, chorus, ...).
 */
export type SongPart = {
  type: string;
  number: number | string;
  class: string;
  content: string;
};

/**
 * Error shape accepted by utils.ts's throwError().
 */
export type ThrowableError = {
  code?: string;
  errorCode?: string;
  message?: string;
  error?: string;
};

/**
 * Shape of SongSet.vue's `initialSong` prop: either the blank-form template
 * (just authors/content/language/publisher/tags/title/translations, see
 * App.vue's initialSong) or a full existing SongEntity when editing/
 * duplicating a song (App.vue's editExistingSong) - the rest is only read
 * when `existing` is true.
 */
export type SongFormData = Partial<SongEntity> & {
  authors: string[];
  content: string;
  language: string;
  publisher: string;
  tags: string[];
  title: string;
  translations: string[];
};

/**
 * Shape of SetlistSet.vue's `initialSetlist` prop: either the blank-form
 * template (just title/isPublic/date/songs, see App.vue's initialSetlist) or
 * a full existing SetlistEntity when editing - the rest is only read when
 * `existing` is true.
 */
export type SetlistFormData = Partial<SetlistEntity> & {
  title: string;
  isPublic: boolean;
  date: string;
  songs: SetlistSong[];
};

/**
 * A setlist song hydrated with its full song entity plus per-setlist custom key.
 */
export type SetlistSongPresentation = SongEntity & { customTuningDelta: number; customTuning: string };

/**
 * vue3-carousel's public .d.ts doesn't expose the imperative instance API
 * (data/slideTo/prev/next/updateSlideSize) that's actually available at
 * runtime via defineExpose, so it's typed loosely here instead.
 */
export type CarouselInstance = {
  data: { currentSlide: number };
  slideTo: (index: number) => void;
  prev: () => void;
  next: () => void;
  updateSlideSize: () => void;
};

/**
 * UI theme mode
 */
export enum ColorScheme {
  Auto = 'auto',
  Dark = 'dark',
  Light = 'light',
}

/**
 * Sort order for setlist and song lists.
 */
export enum SortOrder {
  Newest = 'newest',
  Oldest = 'oldest',
  Random = 'random',
  Popular = 'popular',
}
