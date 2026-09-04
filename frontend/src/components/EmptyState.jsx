import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

// Friendly placeholder shown when the feed has no posts yet.
export default function EmptyState({
  title = 'No posts yet',
  subtitle = 'Be the first to share something with the community.',
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        border: '1px dashed #E5E7EB',
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
      }}
    >
      <ForumOutlinedIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.85 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}
