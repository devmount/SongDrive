/**
 * Available song tags
 */
export enum Tag {
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
export enum Role {
	Admin = 'admin',
	Editor = 'editor',
	Performer = 'performer',
	Reader = 'reader',
};

/**
 * Ruleset
 */
export const can = (action: string, roles: Role[]): boolean => {
  // Get the highes role from the given list of roles
  const level = {
    [Role.Admin]: 8,
	  [Role.Editor]: 4,
	  [Role.Performer]: 2,
	  [Role.Reader]: 1,
  };
  const role = roles.toSorted((a, b) => level[a] - level[b])[0];

  // Admins are allowed in general
  if (role === Role.Admin) {
    return true;
  }

  // All others are assigned as defined here
  switch (action) {
    case 'createSetlists':
      return [Role.Editor, Role.Performer].includes(role);
    case 'createSongs':
      return [Role.Editor].includes(role);
    default:
      return false;
  }
}
