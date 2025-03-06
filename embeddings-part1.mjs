import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import { Ollama } from 'ollama';

const ollama = new Ollama();

async function main() {

  // Step 1: Query headlines from SQLite database
  const db = new Database("../nbc-headlines-scraper/headlines-202409-now.db");
  sqliteVec.load(db);
  
  for(const {id, headline} of db.prepare('SELECT id, headline FROM articles LIMIT 10;').all()) {
    console.log(id, headline);
  }
  
  // comment out to continue to step 2
  //return;

  // Step 2: Try out embeddings with ollama
  const {embeddings} = await ollama.embed({
    model: "all-minilm",
    input: "This is a test"
  });
  console.log(embeddings);
  // comment out to continue to step 3
  //return;

  // Step 3: Save these embeddings into a SQLite database;
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_articles USING vec0(
      headline_embedding float[384]
    );
  `);
  const insertEmbedding = db.prepare(`
    INSERT INTO vec_articles (rowid, headline_embedding) VALUES 
      (cast(? as integer), ?)
  `);
  

  for(const {id, headline} of db.prepare('SELECT id, headline FROM articles;').all()) {
    console.log(id);
    const {embeddings} = await ollama.embed({
      model: "all-minilm",
      input: headline
    });
    
    insertEmbedding.run(id, JSON.stringify(embeddings[0]));
  }
}

main();
