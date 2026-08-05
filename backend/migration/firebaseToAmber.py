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
import sys
import uuid
from datetime import datetime

# CONFIG
filename = sys.argv[1].strip()
tenant = sys.argv[2].strip()
batch_size = 20  # max rows per INSERT statement, to stay within query length limits

with open(filename, encoding='utf-8') as f:
  data = json.load(f)

def chunks(ids):
  """Split a list of ids into batches of at most batch_size."""
  return [ids[i:i + batch_size] for i in range(0, len(ids), batch_size)]

def esc(value):
  """Escape a value for embedding in a double-quoted MariaDB string literal.
  Backslashes must be escaped before quotes, otherwise quote-escaping would
  introduce new backslashes that get wrongly escaped again."""
  return str(value).replace('\\', '\\\\').replace('"', '\\"')

query = ''

# Handle users table
users = {}
for batch in chunks(list(data['users'])):
  query += 'INSERT INTO `users` (`id`, `name`, `email`, `credential_hash`) VALUES '
  for id in batch:
    query += '\n ("' + esc(id) + '", "' + esc(data['users'][id]['name']) + '", "' + esc(data['users'][id]['email']) + '", NULL),'
    users[id] = data['users'][id]['email']
  query = query[:-1] + ';\n\n'

# Handle roles/permissions
# TODO: map actual roles
for batch in chunks(list(data['users'])):
  query += 'INSERT INTO `roles` (`user`, `tenant`, `roles`) VALUES '
  for id in batch:
    query += '\n ("' + esc(id) + '", "' + esc(tenant) + '", "reader"),'
  query = query[:-1] + ';\n\n'

# Handle setlists collection
for batch in chunks(list(data['setlists'])):
  query += 'INSERT INTO `documents` (`tenant`, `collection`, `id`, `change_number`, `change_user`, `change_time`, `data`, `tags`, `access_tags`) VALUES '
  for id in batch:
    amber_id = uuid.uuid4().hex
    change_user = data['setlists'][id]['creator']
    change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    is_public = (not data['setlists'][id]['private']) if 'private' in data['setlists'][id] else True
    setlist_data = json.dumps({
      'active': data['setlists'][id]['active'],
      'createdBy': data['setlists'][id]['creator'],
      'date': data['setlists'][id]['date'],
      'entries': [{ 'id': s['id'][:32], 'key': s['tuning'] } for s in data['setlists'][id]['songs']],
      'isPublic': is_public,
      'position': data['setlists'][id]['position'],
      'sharedWith': [],
      'slug': id,
      'title': data['setlists'][id]['title'],
    }, ensure_ascii=False)
    access_tags = 'o-' + data['setlists'][id]['creator'] + (' public' if is_public else '')
    query += '\n ("' + esc(tenant) + '", "setlists", "' + esc(amber_id) + '", 1, "' + esc(change_user) + '", "' + esc(change_time) + '", "' + esc(setlist_data) + '", "", "' + esc(access_tags) + '"),'
  query = query[:-1] + ';\n\n'

# Handle songs collection
for batch in chunks(list(data['songs'])):
  query += 'INSERT INTO `documents` (`tenant`, `collection`, `id`, `change_number`, `change_user`, `change_time`, `data`, `tags`, `access_tags`) VALUES '
  for id in batch:
    amber_id = id[:32]
    change_user = 'NULL'
    change_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    song_data = json.dumps({
      'authors': data['songs'][id]['authors'].split(' | '),
      'ccli': data['songs'][id]['ccli'],
      'content': data['songs'][id]['content'],
      'createdBy': None,
      'key': data['songs'][id]['tuning'],
      'language': data['songs'][id]['language'],
      'publisher': data['songs'][id]['publisher'],
      'slug': id,
      'subtitle': data['songs'][id]['subtitle'],
      'tags': data['songs'][id]['tags'],
      'title': data['songs'][id]['title'],
      'translations': data['songs'][id]['translations'],
      'year': data['songs'][id]['year'],
      'youtube': data['songs'][id]['youtube'],
    }, ensure_ascii=False)
    query += '\n ("' + esc(tenant) + '", "songs", "' + esc(amber_id) + '", 1, ' + change_user + ', "' + esc(change_time) + '", "' + esc(song_data) + '", NULL, NULL),'
  query = query[:-1] + ';\n\n'

with open("songdrive.sql", "w", encoding="utf-8") as f:
  f.write(query)
