const axios = require('axios');
const xml2js = require('xml2js');

const letterboxdUsername = 'jequeen';
const rssUrl = `https://letterboxd.com/${letterboxdUsername}/rss/`;

async function fetchRSS() {
  try {
    const response = await axios.get(rssUrl);
    const parsedData = await xml2js.parseStringPromise(response.data, { mergeAttrs: true, explicitArray: false });
    return parsedData.rss.channel.item || [];
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
}

async function getAccountId(username) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT AccountID FROM Accounts WHERE LetterboxdUsername = ?',
      [username],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(row ? row.AccountID : null);
        }
      }
    );
  });
}


async function movieExists(accountId, tmdbId) {
  const rows = await new Promise((resolve, reject) => {
    db.all(
      'SELECT 1 FROM FilmsWatched WHERE AccountID = ? AND TMDB_ID = ?',
      [accountId, tmdbId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  return rows.length > 0;
}


async function insertWatchedMovie(accountId, tmdbId, watchedAt) {
  await db.all('INSERT INTO FilmsWatched (AccountID, TMDB_ID, WatchedAt) VALUES (?, ?, ?)', [accountId, tmdbId, watchedAt]);
}

async function processRSS() {
  const accountId = await getAccountId(letterboxdUsername);
  console.log(accountId);
  if (!accountId) {
    console.error('Account not found in database');
    return;
  }
  const movies = await fetchRSS();
  for (const movie of movies) {
    const tmdbId = movie['tmdb:movieId'];
    const watchedAt = movie['letterboxd:watchedDate'];

    if (!tmdbId || !watchedAt) continue;
    if (await movieExists(accountId, tmdbId)) continue;

    await insertWatchedMovie(accountId, tmdbId, watchedAt);
    console.log(`Inserted movie ${tmdbId} watched on ${watchedAt}`);
  }
}

setInterval(processRSS, 60 * 60 * 1000);
processRSS().then(r => {} );

module.exports = { processRSS };
