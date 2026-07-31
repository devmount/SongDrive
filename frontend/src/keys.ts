import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { marked } from 'marked';
import type { AmberClient, AmberCollection, UserInfo } from 'amber-client';
import type { Song, SongEntity, Setlist, SetlistEntity } from '@backend/models';
import type { SongTag, UserRole } from '@backend/definitions';

// user shape provided by App.vue's `user` computed
export type AppUser = {
  id?: string;
  name: string;
  email: string;
  roles: UserRole[];
  photo: null;
};

// data
export const songsKey: InjectionKey<Ref<Song[]>> = Symbol('songs');
export const setlistsKey: InjectionKey<Ref<Setlist[]>> = Symbol('setlists');
export const tagsKey: InjectionKey<SongTag[]> = Symbol('tags');
export const userKey: InjectionKey<ComputedRef<AppUser>> = Symbol('user');
export const usersKey: InjectionKey<Ref<Record<string, UserInfo>>> = Symbol('users');
export const readyKey: InjectionKey<Ref<boolean>> = Symbol('ready');

// amber client / collections
export const clientKey: InjectionKey<Ref<AmberClient | null>> = Symbol('client');
export const songsCollectionKey: InjectionKey<Ref<AmberCollection<SongEntity> | null>> = Symbol('songsCollection');
export const setlistCollectionKey: InjectionKey<Ref<AmberCollection<SetlistEntity> | null>> = Symbol('setlistCollection');

// ui state
export const noActiveModalKey: InjectionKey<ComputedRef<boolean>> = Symbol('noActiveModal');
export const noActiveInputKey: InjectionKey<ComputedRef<boolean>> = Symbol('noActiveInput');

// hotkeys (useMagicKeys refs)
export const hkBackKey: InjectionKey<Ref<boolean>> = Symbol('hkBack');
export const hkCancelKey: InjectionKey<Ref<boolean>> = Symbol('hkCancel');
export const hkChordsKey: InjectionKey<Ref<boolean>> = Symbol('hkChords');
export const hkDownKey: InjectionKey<Ref<boolean>> = Symbol('hkDown');
export const hkForwardKey: InjectionKey<Ref<boolean>> = Symbol('hkForward');
export const hkGoKey: InjectionKey<Ref<boolean>> = Symbol('hkGo');
export const hkHideKey: InjectionKey<Ref<boolean>> = Symbol('hkHide');
export const hkPresentKey: InjectionKey<Ref<boolean>> = Symbol('hkPresent');
export const hkResetKey: InjectionKey<Ref<boolean>> = Symbol('hkReset');
export const hkSearchKey: InjectionKey<Ref<boolean>> = Symbol('hkSearch');
export const hkSyncKey: InjectionKey<Ref<boolean>> = Symbol('hkSync');
export const hkThemeKey: InjectionKey<Ref<boolean>> = Symbol('hkTheme');
export const hkUpKey: InjectionKey<Ref<boolean>> = Symbol('hkUp');

// app-level (provided in main.ts, not App.vue)
export const versionKey: InjectionKey<string> = Symbol('version');
export const markedKey: InjectionKey<typeof marked> = Symbol('marked');

/**
 * Strict-typed inject(): throws instead of silently returning `T | undefined`,
 * since every one of these keys is always provided before any child mounts.
 */
export function injectStrict<T>(key: InjectionKey<T>): T {
  const value = inject(key);
  if (value === undefined) {
    throw new Error(`Injection "${String(key.description)}" not found — component must be a descendant of App.vue.`);
  }
  return value;
}
