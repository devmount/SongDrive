"""Converts a Firebase JSON export to an SQL import script

This script takes a JSON filename as command line argument. This
file contains a json object holding collections for songs, setlists
and users. It is allowed to contain more, but only those will be
converted by this script.

Just run this script like this:

    python firebaseToAmber.py <exported.json> <tenant>

It produces a new file songdrive.sql, containing SQL INSERT statements
in a Amberbase compatible format to import int the MariaDB of Amberbase.
"""

import json
import uuid
import sys
from datetime import datetime

# CONFIG
filename = sys.argv[1].strip()
tenant = sys.argv[2].strip()

with open(filename, encoding='utf-8') as f:
  data = json.load(f)

# Handle users table
users = {}
query = 'INSERT INTO `users` (`id`, `name`, `email`, `credential_hash`) VALUES '
for id in data['users']:
  query += '\n ("' + id + '", "' + data['users'][id]['name'] + '", "' + data['users'][id]['email'] + '", NULL),'
  users[id] = data['users'][id]['email']

query = query[:-1] + ';\n\n'

# Handle roles/permissions
query += 'INSERT INTO `roles` (`user`, `tenant`, `roles`) VALUES '
for id in data['users']:
  query += '\n ("' + id + '", "' + tenant + '", "reader"),'
query = query[:-1] + ';\n\n'

# Handle setlists collection
query += 'INSERT INTO `documents` (`tenant`, `collection`, `id`, `change_number`, `change_user`, `change_time`, `data`, `tags`, `access_tags`) VALUES '
for id in data['setlists']:
  amber_id = uuid.uuid4().hex
  change_user = data['setlists'][id]['creator']
  change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
  is_public = (not data['setlists'][id]['private']) if 'private' in data['setlists'][id] else True
  setlist_data = json.dumps({
    'active': data['setlists'][id]['active'],
    'createdBy': data['setlists'][id]['creator'],
    'date': data['setlists'][id]['date'],
    'isPublic': is_public,
    'position': data['setlists'][id]['position'],
    'sharedWith': [],
    'slug': id,
    'songs': [{ 'id': s['id'][:32], 'key': s['tuning'] } for s in data['setlists'][id]['songs']],
    'title': data['setlists'][id]['title'],
  }, ensure_ascii=False).replace('"', '\\"')
  access_tags = 'o-' + data['setlists'][id]['creator'] + (' public' if is_public else '')
  query += '\n ("' + tenant + '", "setlists", "' + amber_id + '", 1, "' + change_user + '", "' + change_time + '", "' + setlist_data + '", "", "' + access_tags + '"),'
query = query[:-1] + ';\n\n'

# Handle songs collection
query += 'INSERT INTO `documents` (`tenant`, `collection`, `id`, `change_number`, `change_user`, `change_time`, `data`, `tags`, `access_tags`) VALUES '
for i, id in enumerate(data['songs']):
  amber_id = id[:32]
  change_user = 'NULL'
  change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
  song_data = json.dumps({
    'authors': data['songs'][id]['authors'].split(' | '),
    'ccli': data['songs'][id]['ccli'],
    'content': data['songs'][id]['content'].replace('"', '\'').replace('\n', '\\n'),
    'createdBy': None,
    'key': data['songs'][id]['tuning'],
    'language': data['songs'][id]['language'],
    'publisher': data['songs'][id]['publisher'].replace('\n', '\\n'),
    'slug': id,
    'subtitle': data['songs'][id]['subtitle'],
    'tags': data['songs'][id]['tags'],
    'title': data['songs'][id]['title'],
    'translations': data['songs'][id]['translations'],
    'year': data['songs'][id]['year'],
    'youtube': data['songs'][id]['youtube'],
  }, ensure_ascii=False).replace('"', '\\"')
  query += '\n ("' + tenant + '", "songs", "' + amber_id + '", 1, ' + change_user + ', "' + change_time + '", "' + song_data + '", NULL, NULL),'
query = query[:-1] + ';\n\n'

with open("songdrive.sql", "w", encoding="utf-8") as f:
  f.write(query)
