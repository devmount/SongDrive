import { describe, expect, it } from 'vitest';
import { setlistsAccessRights, setlistsAccessTagsFromDocument, setlistsAccessTagsFromUser } from '../access.js';
import { SetlistEntity } from '../models.js';
import { UserRole } from '../definitions.js';

const setlist = (overrides: Partial<SetlistEntity> = {}): SetlistEntity => ({
	active: false,
	createdBy: 'owner',
	date: '2026-01-01',
	isPublic: false,
	position: 0,
	sharedWith: [],
	slug: 'a-setlist',
	songs: [],
	title: 'A setlist',
	...overrides,
});

describe('setlistsAccessRights', () => {
	describe('create', () => {
		it('allows editors and performers', () => {
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Editor] }, null, 'create')).toBe(true);
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Performer] }, null, 'create')).toBe(true);
		});

		it('allows readers to create their own private setlist', () => {
			const doc = setlist({ createdBy: 'u1', isPublic: false });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, doc, 'create')).toBe(true);
		});

		it('rejects readers creating a public setlist, or one not owned by them', () => {
			const publicDoc = setlist({ createdBy: 'u1', isPublic: true });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, publicDoc, 'create')).toBe(false);

			const othersDoc = setlist({ createdBy: 'u2', isPublic: false });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, othersDoc, 'create')).toBe(false);
		});
	});

	describe('subscribe', () => {
		it('allows every role', () => {
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Editor] }, null, 'subscribe')).toBe(true);
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Performer] }, null, 'subscribe')).toBe(true);
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, null, 'subscribe')).toBe(true);
		});
	});

	describe('delete', () => {
		it('allows editors regardless of ownership', () => {
			const doc = setlist({ createdBy: 'someone-else' });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Editor] }, doc, 'delete')).toBe(true);
		});

		it('allows the owner regardless of role', () => {
			const doc = setlist({ createdBy: 'u1' });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, doc, 'delete')).toBe(true);
		});

		it('rejects non-owner, non-editors', () => {
			const doc = setlist({ createdBy: 'u2' });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Performer] }, doc, 'delete')).toBe(false);
		});
	});

	describe('update', () => {
		it('allows the owner regardless of role', () => {
			const doc = setlist({ createdBy: 'u1', isPublic: false });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, doc, 'update')).toBe(true);
		});

		it('allows editors/performers to update public setlists they do not own', () => {
			const doc = setlist({ createdBy: 'u2', isPublic: true });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Editor] }, doc, 'update')).toBe(true);
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Performer] }, doc, 'update')).toBe(true);
		});

		it('rejects readers on public setlists they do not own', () => {
			const doc = setlist({ createdBy: 'u2', isPublic: true });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Reader] }, doc, 'update')).toBe(false);
		});

		it('rejects non-owners on private setlists', () => {
			const doc = setlist({ createdBy: 'u2', isPublic: false });
			expect(setlistsAccessRights({ userId: 'u1', roles: [UserRole.Editor] }, doc, 'update')).toBe(false);
		});
	});
});

describe('setlistsAccessTagsFromDocument', () => {
	it('tags a public setlist with the owner and public tags', () => {
		const doc = setlist({ createdBy: 'u1', isPublic: true, sharedWith: ['u2'] });
		expect(setlistsAccessTagsFromDocument(doc)).toEqual(['o-u1', 'public']);
	});

	it('tags a private setlist with the owner and each shared user', () => {
		const doc = setlist({ createdBy: 'u1', isPublic: false, sharedWith: ['u2', 'u3'] });
		expect(setlistsAccessTagsFromDocument(doc)).toEqual(['o-u1', 's-u2', 's-u3']);
	});
});

describe('setlistsAccessTagsFromUser', () => {
	it('returns the public tag plus the user\'s own owner/shared tags', () => {
		expect(setlistsAccessTagsFromUser({ userId: 'u1', roles: [UserRole.Reader] })).toEqual(['public', 'o-u1', 's-u1']);
	});
});
