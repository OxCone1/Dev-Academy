const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient

let cachedClient = null;
let cachedDb = null;

async function dB() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("academy");
  
  cachedClient = client;
  cachedDb = db;
  return db;
}

module.exports = { dB };