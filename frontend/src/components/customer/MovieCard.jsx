import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';

export default function MovieCard({ id, title, genre, poster, onBook }) {
  return (
    <Card sx={{ bgcolor: 'background.paper' }}>
      <CardMedia component="img" height="240" image={poster} alt={title} />
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          {genre && (
            <Typography variant="caption" color="text.secondary">
              {genre}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={Link} to={`/movie/${id}`} variant="outlined" color="secondary">
          Details
        </Button>
        <Button component={Link} to={`/show/${id}/seats`} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
          Book
        </Button>
      </CardActions>
    </Card>
  );
}


