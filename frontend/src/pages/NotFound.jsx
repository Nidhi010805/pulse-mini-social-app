import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        backgroundColor: '#F5F7FB',
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: 64, sm: 96 }, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        This page doesn&apos;t exist
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for may have been moved or removed.
      </Typography>
      <Button component={RouterLink} to="/feed" variant="contained">
        Back to Feed
      </Button>
    </Box>
  );
}
