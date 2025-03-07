import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import { Ollama } from 'ollama';
import { readFileSync } from "node:fs";

const ollama = new Ollama();
const NICAR_SCHEDULE_JSON_PATH = 'nicar-2025-schedule.json';

function importSchedule(db) {
  const data = JSON.parse(readFileSync(NICAR_SCHEDULE_JSON_PATH));
  const insertSession = db.prepare(`
    INSERT INTO sessions (session_id, session_title, description, session_type, start_time, end_time, duration_mins, skill_level, room_name, day) 
      VALUES (:session_id, :session_title, :description, :session_type, :start_time, :end_time, :duration_mins, :skill_level, :room_name, :day);
  `);
  
  const insertSpeaker = db.prepare(`
    INSERT INTO speakers (session_id, first_name, last_name, affiliation, bio) 
      VALUES (:session_id, :first_name, :last_name, :affiliation, :bio);
  `);

  for(const session of data) {
    insertSession.run({...session, room_name: session.room.room_name});
    for(const speaker of session.speakers) {
      insertSpeaker.run({
        session_id: session.session_id,
        first_name: speaker.first,
        last_name: speaker.last,
        affiliation: speaker.affiliation,
        bio: speaker.bio
      });
    }
  }
}

async function generateEmbeddings(db) {
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_sessions USING vec0(
      description_embedding float[384]
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS vec_speakers USING vec0(
      bio_embedding float[384]
    );
  `);

  const insertSessionEmbedding = db.prepare(`
    INSERT INTO vec_sessions (rowid, description_embedding) VALUES 
      (cast(? as integer), ?)
  `);
  const insertSpeakerEmbedding = db.prepare(`
    INSERT INTO vec_speakers (rowid, bio_embedding) VALUES 
      (cast(? as integer), ?)
  `);
  
  for(const {session_id, description} of db.prepare('SELECT session_id, description FROM sessions').all()) {
    // skip session with empty descriptions
    if(!description) {
      continue;
    }
    console.log(session_id);
    const {embeddings} = await ollama.embed({
      model: "all-minilm",
      input: description
    });
    insertSessionEmbedding.run(session_id, JSON.stringify(embeddings[0]));
  }

  for(const {speaker_id, bio} of db.prepare('SELECT speaker_id, bio FROM speakers').all()) {
    // skip speakers with empty bios
    if(!bio) {
      continue;
    }
    console.log(speaker_id);
    const {embeddings} = await ollama.embed({
      model: "all-minilm",
      input: bio
    });
    insertSpeakerEmbedding.run(speaker_id, JSON.stringify(embeddings[0]));
  }
}

async function build(path) {
  const db = new Database(":memory:");
  sqliteVec.load(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id INTEGER PRIMARY KEY,
      session_title TEXT,
      description TEXT,
      session_type TEXT,
      start_time TEXT,
      end_time TEXT,
      duration_mins INTEGER,
      evergreen BOOLEAN,
      skill_level TEXT,
      room_name TEXT,
      day TEXT
    );

    CREATE TABLE IF NOT EXISTS speakers (
      speaker_id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      first_name TEXT,
      last_name TEXT,
      affiliation TEXT,
      bio TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    );
  `);
  importSchedule(db);
  await generateEmbeddings(db);
  db.prepare('vacuum into ?').run(path);
  console.log(`Successfully saved database to ${path}`)
}

async function searchSessions(path, query) {
  console.log(`Searching for NICAR sessions related to: ${query}...`);
  const db = new Database(path);
  sqliteVec.load(db);
  const result = await ollama.embed({
    model: "all-minilm",
    input: query
  });
  const queryEmbedding = result.embeddings[0];
  const knnQuery = db.prepare(`
      SELECT 
        rowid, 
        distance,
        sessions.description
      FROM vec_sessions 
      LEFT JOIN sessions ON sessions.session_id = vec_sessions.rowid
      WHERE description_embedding MATCH ? 
        AND k = 10;
    `);
  
  for(const {rowid, distance, description} of knnQuery.all(JSON.stringify(queryEmbedding))) {
    console.log(rowid, distance, description);
  }
}
async function searchSpeakers(path, query) {
  // TODO try yourself!
}

async function main() {
  switch( process.argv[2] ) {
    case "build": {
      await build(process.argv[3]);
      break;
    }
    case "search-sessions":{
      await searchSessions(process.argv[3], process.argv[4]);
      break;
    }
    case "search-speakers":{
      await searchSpeakers(process.argv[3], process.argv[4]);
      break;
    }
    default: {
      console.log(
`Usage: 
  node embeddings-nicar.mjs build <database>
  node embeddings-nicar.mjs search-sessions <database> <query>
  node embeddings-nicar.mjs search-speakers <database> <query>
`
);
    }
  }
}

main();
