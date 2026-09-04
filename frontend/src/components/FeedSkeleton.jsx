import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// Placeholder skeleton for a single post card, shown while the feed loads.
function SkeletonPostCard() {
  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="35%" height={20} />
            <Skeleton variant="text" width="20%" height={16} />
          </Box>
        </Box>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="70%" sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" width="100%" height={220} sx={{ mb: 1.5 }} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" width={70} height={32} />
          <Skeleton variant="rounded" width={90} height={32} />
        </Stack>
      </CardContent>
    </Card>
  );
}

// Renders a configurable number of skeleton cards to mimic the feed layout.
export default function FeedSkeleton({ count = 3 }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPostCard key={index} />
      ))}
    </Box>
  );
}
