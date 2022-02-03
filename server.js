require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const MOVIEDEX = require('./movie-data.json');

const app = express();
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization').split(' ')[1];
  const apiToken = process.env.API_TOKEN;
  if (authToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  next();
}

app.use(validateBearerToken);

function handleGetMovies(req, res) {
  const { genre, country, avg_vote } = req.query;
  console.log(country);
  let movies = MOVIEDEX;
  if (!(genre || country || avg_vote)) {
    return res.json(movies);
  }
  if (genre) {
    movies = MOVIEDEX.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    movies = MOVIEDEX.filter((movie) =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  if (avg_vote) {
    movies = MOVIEDEX.filter((movie) => movie.avg_vote >= avg_vote);
  }

  res.json(movies);

  // if (!(country || genre)) res.json(movies.map((movie) => movie.country));
}
app.get('/movies', handleGetMovies);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'prodcution') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.API_TOKEN || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
