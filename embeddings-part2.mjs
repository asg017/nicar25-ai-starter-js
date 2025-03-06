import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";
import { Ollama } from 'ollama';

const ollama = new Ollama();

async function main() {

  const db = new Database("../nbc-headlines-scraper/headlines-202409-now.db");
  sqliteVec.load(db);
  
  const query = "reproductive rights";

  const result = await ollama.embed({
    model: "all-minilm",
    input: query
  });
  const queryEmbedding = result.embeddings[0];
  const knnQuery = db.prepare(`
      SELECT 
        rowid, 
        distance,
        articles.headline
      FROM vec_articles 
      LEFT JOIN articles ON articles.id = vec_articles.rowid
      WHERE headline_embedding MATCH ? 
        AND k = 10;
    `);
  
  console.log(query);
  for(const {rowid, distance, headline} of knnQuery.all(JSON.stringify(queryEmbedding))) {
    console.log(rowid, distance, headline);
  }
}

main();
