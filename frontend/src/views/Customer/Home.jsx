import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MovieCard from '../../components/customer/MovieCard';
import { IconMovie } from '@tabler/icons-react';

const sampleMovies = [
  { id: 'space-adventure', title: 'Space Adventure', genre: 'Sci‑Fi', poster: '/space-adventure-movie-poster.jpg' },
  { id: 'dark-knight', title: 'The Dark Knight', genre: 'Action', poster: '/dark-knight-poster.png' },
  { id: 'paris-romance', title: 'Paris Romance', genre: 'Romance', poster: '/romantic-paris-movie-poster.jpg' }
];

export default function CustomerHome() {
  const showAdminButton = import.meta.env.MODE !== 'production' || import.meta.env.VITE_SHOW_ADMIN_LOGIN === 'true';
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 6,
        background:
          'radial-gradient(1200px 600px at 10% -10%, rgba(88,28,135,0.35) 0%, rgba(88,28,135,0) 60%), radial-gradient(1000px 500px at 110% 10%, rgba(0,123,255,0.25) 0%, rgba(0,123,255,0) 60%), linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(18,18,18,1) 100%)'
      }}
    >
      <Container>
      {/* Hero */}
      <Box
        sx={{
          mb: 5,
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(88,28,135,0.6) 100%), url(/dark-knight-poster.png) center/cover no-repeat',
          color: 'white',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: 'center', gap: 3 }}>
          <IconMovie size={48} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3">Experience Unique Cinema</Typography>
            <Typography sx={{ opacity: 0.9, mt: 1 }}>
              Discover limited‑run screenings hosted by promoters at partner theatres.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
            <Button href="#now-showing" variant="contained" color="secondary" size="large">
              Browse Movies
            </Button>
            {showAdminButton && (
              <Button href="/pages/login" variant="outlined" color="inherit" size="large">
                Admin Login
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Grid */}
      <Typography id="now-showing" variant="h4" sx={{ mb: 3 }}>
        Now Showing
      </Typography>
      <Grid container spacing={3}>
        {sampleMovies.map((m) => (
          <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <MovieCard {...m} />
          </Grid>
        ))}
      </Grid>
      </Container>
    </Box>
  );
}


