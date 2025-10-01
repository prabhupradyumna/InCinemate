// Test script to debug movie edit data structure
const axios = require('axios');

const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from localStorage

async function testMovieData() {
  try {
    // Replace 'movie-id' with an actual movie ID from your database
    const response = await axios.get('http://localhost:9000/api/superadmin/movies/MOVIE_ID_HERE', {
      params: { include_relations: true },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Movie Data Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const movie = response.data?.data;
    if (movie) {
      console.log('\n=== Field Analysis ===');
      console.log('Title:', typeof movie.title, movie.title);
      console.log('Genres:', typeof movie.genres, Array.isArray(movie.genres), movie.genres);
      console.log('Languages:', typeof movie.languages, Array.isArray(movie.languages), movie.languages);
      console.log('Cast:', typeof movie.cast, Array.isArray(movie.cast), movie.cast?.length || 0);
      console.log('Crew:', typeof movie.crew, Array.isArray(movie.crew), movie.crew?.length || 0);
      console.log('Poster URL:', typeof movie.poster_url, movie.poster_url);
      console.log('Backdrop URL:', typeof movie.backdrop_url, movie.backdrop_url);
      console.log('Release Date:', typeof movie.release_date, movie.release_date);
    }
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testMovieData();