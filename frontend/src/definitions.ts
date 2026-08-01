import type { SongEntity, SetlistEntity, SetlistSong } from '@backend/models';
import type { UserRole } from '@backend/definitions';

/**
 * User shape provided by App.vue's `user` computed, combining Amberbase's
 * authenticated user with SongDrive's role model.
 */
export type AppUser = {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
  photo: null;
};

/**
 * A single parsed part of a song's content (verse, chorus, ...), as returned
 * by utils.ts's parsedContent().
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
 * Form-shaped song data for SongSet.vue: also accepted directly from an
 * existing SongEntity when editing/duplicating a song (App.vue's
 * editExistingSong). `ccli`/`year` are `string | number` because Vue
 * auto-casts <input type="number"> v-models to number once non-empty (see
 * @vue/runtime-dom's vModelText castToNumber), while the blank-form default
 * and an empty field are both ''.
 */
export type SongFormData = {
  authors: string[];
  ccli?: string | number;
  content: string;
  createdBy?: string;
  key?: string;
  language: string;
  publisher: string;
  subtitle?: string;
  tags: string[];
  title: string;
  translations: string[];
  year?: string | number;
  youtube?: string;
};

/**
 * Shape of SetlistSet.vue's `initialSetlist` prop: either the blank-form
 * template (just title/isPublic/date/songs, see App.vue's initialSetlist) or
 * a full existing SetlistEntity when editing - the rest is only read when
 * `existing` is true.
 */
export type SetlistFormInitial = Partial<SetlistEntity> & {
  title: string;
  isPublic: boolean;
  date: string;
  songs: SetlistSong[];
};

/**
 * A setlist song hydrated with its full song entity plus per-setlist custom
 * tuning, as built by SetlistShow.vue's setlistSongs and consumed by
 * SetlistPresent.vue for presentation.
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
