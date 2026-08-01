import { CollectionAccessAction, UserContext } from 'amberbase';
import { SetlistEntity } from './models.js';
import { UserRole } from './definitions.js';

/**
 * Access rights for the setlists collection.
 * Public setlists can be created by editors and performers.
 * Private setlists can be created by everyone.
 */
export const setlistsAccessRights = (user: UserContext, doc: SetlistEntity | null, action: CollectionAccessAction): boolean => {
	if (action === 'create') {
		if (user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer)) {
			return true;
		}
		if (user.roles.includes(UserRole.Reader)) {
			return doc?.createdBy === user.userId && !doc?.isPublic;
		}
		return false;
	}
	// Setlists can be subscribed to by all roles, but only public setlists can be read per default.
	// This is done via access tags below.
	if (action === 'subscribe') {
		return user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer) || user.roles.includes(UserRole.Reader);
	}
	// Setlists can be deleted by editors or the corresponding creator.
	if (action === 'delete') {
		return user.roles.includes(UserRole.Editor) || doc?.createdBy === user.userId;
	}
	// Setlists can be updated by the corresponding creator.
	// Public setlists can be updated by editors and performers.
	if (action === 'update') {
		if (doc?.createdBy === user.userId) {
			return true;
		}
		if (doc?.isPublic && (user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer))) {
			return true;
		}
		return false;
	}

	return false;
};

/**
 * The owner of a private setlist can share it with other users
 */
export const setlistsAccessTagsFromDocument = (doc: SetlistEntity): string[] => {
	const tags = [`o-${doc.createdBy}`];
	if (doc.isPublic) {
		tags.push('public');
	} else {
		doc.sharedWith.forEach((userId) => {
			tags.push(`s-${userId}`);
		});
	}
	return tags;
};

export const setlistsAccessTagsFromUser = (user: UserContext): string[] => [
	'public',
	`o-${user.userId}`,
	`s-${user.userId}`,
];
