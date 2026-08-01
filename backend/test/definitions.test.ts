import { describe, expect, it } from 'vitest';
import { can } from '../definitions.js';
import { UserRole } from '../definitions.js';

describe('can', () => {
	it('rejects an empty action', () => {
		expect(can('', [UserRole.Editor])).toBe(false);
	});

	it('rejects an empty roles list', () => {
		expect(can('createSetlists', [])).toBe(false);
	});

	it('allows admins to do anything, including unknown actions', () => {
		expect(can('createSetlists', [UserRole.Admin])).toBe(true);
		expect(can('deleteSongs', [UserRole.Admin])).toBe(true);
		expect(can('nonsenseAction', [UserRole.Admin])).toBe(true);
	});

	it('resolves the highest-privilege role out of a mixed roles list', () => {
		// reader+editor should behave like editor alone
		expect(can('createSetlists', [UserRole.Reader, UserRole.Editor])).toBe(true);
		expect(can('createSongs', [UserRole.Reader, UserRole.Editor])).toBe(true);
		// admin+editor should still get the admin bypass
		expect(can('nonsenseAction', [UserRole.Admin, UserRole.Editor])).toBe(true);
	});

	it('rejects an unknown action for non-admins', () => {
		expect(can('nonsenseAction', [UserRole.Editor])).toBe(false);
	});

	describe('createSetlists', () => {
		it('allows editors and performers', () => {
			expect(can('createSetlists', [UserRole.Editor])).toBe(true);
			expect(can('createSetlists', [UserRole.Performer])).toBe(true);
		});

		it('rejects readers', () => {
			expect(can('createSetlists', [UserRole.Reader])).toBe(false);
		});
	});

	describe('updateSetlists', () => {
		it('rejects without a context, regardless of role', () => {
			expect(can('updateSetlists', [UserRole.Editor])).toBe(false);
		});

		it('allows the owner regardless of role', () => {
			expect(can('updateSetlists', [UserRole.Reader], { userId: 'u1', ownerId: 'u1', isPublic: false })).toBe(true);
		});

		it('allows editors/performers to update public setlists they do not own', () => {
			expect(can('updateSetlists', [UserRole.Editor], { userId: 'u1', ownerId: 'u2', isPublic: true })).toBe(true);
			expect(can('updateSetlists', [UserRole.Performer], { userId: 'u1', ownerId: 'u2', isPublic: true })).toBe(true);
		});

		it('rejects readers on public setlists they do not own', () => {
			expect(can('updateSetlists', [UserRole.Reader], { userId: 'u1', ownerId: 'u2', isPublic: true })).toBe(false);
		});

		it('rejects non-owners on private setlists', () => {
			expect(can('updateSetlists', [UserRole.Editor], { userId: 'u1', ownerId: 'u2', isPublic: false })).toBe(false);
		});
	});

	describe('deleteSetlists', () => {
		it('allows editors even without a context', () => {
			expect(can('deleteSetlists', [UserRole.Editor])).toBe(true);
		});

		it('allows the owner', () => {
			expect(can('deleteSetlists', [UserRole.Reader], { userId: 'u1', ownerId: 'u1' })).toBe(true);
		});

		it('rejects non-owner, non-editors', () => {
			expect(can('deleteSetlists', [UserRole.Performer], { userId: 'u1', ownerId: 'u2' })).toBe(false);
			expect(can('deleteSetlists', [UserRole.Reader])).toBe(false);
		});
	});

	describe.each(['createSongs', 'updateSongs', 'deleteSongs'])('%s', (action) => {
		it('allows editors', () => {
			expect(can(action, [UserRole.Editor])).toBe(true);
		});

		it('rejects performers and readers', () => {
			expect(can(action, [UserRole.Performer])).toBe(false);
			expect(can(action, [UserRole.Reader])).toBe(false);
		});
	});
});
