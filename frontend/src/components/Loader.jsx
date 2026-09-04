import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Small reusable spinner, optionally with a label. Used for full-page
// or inline loading states (posting, commenting, initial feed load).
export default function Loader({ size = 24, label, fullHeight = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: fullHeight ? 0 : 4,
        height: fullHeight ? '60vh' : 'auto',
      }}
    >
      <CircularProgress size={size} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
