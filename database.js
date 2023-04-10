const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/myDatabase.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

const createUserTable = () => {
  const query = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );`;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const createCardTable = () => {
  const query = `
  CREATE TABLE IF NOT EXISTS mtg_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    manaCost TEXT,
    cmc INTEGER,
    colors TEXT,
    types TEXT,
    subtypes TEXT,
    text TEXT,
    power TEXT,
    toughness TEXT,
    flavorText TEXT
);`;

  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = {
  db,
  createUserTable,
  createCardTable
};