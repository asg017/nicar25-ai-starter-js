
// solution!
async function searchSpeakers(path, query) {
  console.log(`Searching for NICAR speakers related to: ${query}...`);
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
        speakers.bio
      FROM vec_speakers 
      LEFT JOIN speakers ON speakers.speaker_id = vec_speakers.rowid
      WHERE bio_embedding MATCH ? 
        AND k = 10;
    `);
  
  console.log(query);
  for(const {rowid, distance, bio} of knnQuery.all(JSON.stringify(queryEmbedding))) {
    console.log(rowid, distance, bio);
  }
}