/**
 * Available song tags
 */
export enum SongTag {
  Adoration = 'adoration',
  Assurance = 'assurance',
  Beauty = 'beauty',
  Blessing = 'blessing',
  Celebration = 'celebration',
  Children = 'children',
  Christmas = 'christmas',
  Comfort = 'comfort',
  Commitment = 'commitment',
  Communion = 'communion',
  Creation = 'creation',
  Cross = 'cross',
  Declaration = 'declaration',
  Desire = 'desire',
  Easter = 'easter',
  Encouragement = 'encouragement',
  Evangelism = 'evangelism',
  Faith = 'faith',
  Faithfulness = 'faithfulness',
  Father = 'father',
  Forgiveness = 'forgiveness',
  Freedom = 'freedom',
  Glory = 'glory',
  Grace = 'grace',
  Greatness = 'greatness',
  Guidance = 'guidance',
  Healing = 'healing',
  Holiness = 'holiness',
  HolySpirit = 'holyspirit',
  Hope = 'hope',
  Humility = 'humility',
  Jesus = 'jesus',
  Joy = 'joy',
  Kingship = 'kingship',
  Life = 'life',
  Light = 'light',
  Longing = 'longing',
  Love = 'love',
  Obedience = 'obedience',
  Peace = 'peace',
  Petition = 'petition',
  Power = 'power',
  Praise = 'praise',
  Prayer = 'prayer',
  Presence = 'presence',
  Rest = 'rest',
  Resurrection = 'resurrection',
  Revival = 'revival',
  Sacrifice = 'sacrifice',
  Salvation = 'salvation',
  Strength = 'strength',
  Surrender = 'surrender',
  Thankfulness = 'thankfulness',
  Trust = 'trust',
  Truth = 'truth',
  Unity = 'unity',
  Victory = 'victory',
  Worship = 'worship',
}

/**
 * Available song languges
 */
export enum SongLanguage {
  DE = 'de',
  EN = 'en',
  FR = 'fr',
  HE = 'he',
  LI = 'li',
}

/**
 * Supported user permission roles
 */
export enum UserRole {
	Admin = 'admin',
	Editor = 'editor',
	Performer = 'performer',
	Reader = 'reader',
};

/**
 * Ownership/visibility context for actions whose access depends on a
 * specific document rather than just the user's role (e.g. setlist
 * update/delete, which the backend also gates by ownership and isPublic
 * per the setlists collection's accessRights in backend/index.ts).
 */
export type CanContext = {
  userId?: string;
  ownerId?: string;
  isPublic?: boolean;
};

/**
 * Ruleset to check of a given roles list
 */
export const can = (action: string, roles: UserRole[], context?: CanContext): boolean => {
  // Check valid input
  if (!action || !roles) return false;

  // Get the highes role from the given list of roles
  const level = {
    [UserRole.Admin]: 8,
	  [UserRole.Editor]: 4,
	  [UserRole.Performer]: 2,
	  [UserRole.Reader]: 1,
  };
  const highestRole = roles.toSorted((a, b) => level[a] - level[b])[0];

  // Admins are allowed in general
  if (highestRole === UserRole.Admin) {
    return true;
  }

  // All others are assigned as defined here
  switch (action) {
    case 'createSetlists':
      return [UserRole.Editor, UserRole.Performer].includes(highestRole);
    case 'updateSetlists':
      // owned by the current user, or public and editor/performer
      if (!context) return false;
      if (context.userId && context.userId === context.ownerId) return true;
      return !!context.isPublic && [UserRole.Editor, UserRole.Performer].includes(highestRole);
    case 'deleteSetlists':
      // editors may delete any setlist, others only their own
      if (highestRole === UserRole.Editor) return true;
      return !!context && !!context.userId && context.userId === context.ownerId;
    case 'createSongs':
    case 'updateSongs':
    case 'deleteSongs':
      return [UserRole.Editor].includes(highestRole);
    default:
      return false;
  }
}
