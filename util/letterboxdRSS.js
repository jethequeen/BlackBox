const axios = require('axios');
const xml2js = require('xml2js');

// Letterboxd username to track
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
  const [rows] = await global.db.query('SELECT AccountID FROM Accounts WHERE LetterboxdUsername = ?', [username]);
  return rows.length > 0 ? rows[0].AccountID : null;
}

async function movieExists(accountId, tmdbId) {
  const [rows] = await db.query('SELECT 1 FROM FilmsWatched WHERE AccountID = ? AND TMDB_ID = ?', [accountId, tmdbId]);
  return rows.length > 0;
}

async function insertWatchedMovie(accountId, tmdbId, watchedAt) {
  await db.query('INSERT INTO FilmsWatched (AccountID, TMDB_ID, WatchedAt) VALUES (?, ?, ?)', [accountId, tmdbId, watchedAt]);
}

async function processRSS() {
  const accountId = await getAccountId(letterboxdUsername);
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

// Run every hour
setInterval(processRSS, 60 * 60 * 1000);
processRSS();
