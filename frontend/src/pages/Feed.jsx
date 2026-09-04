import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import FeedSkeleton from '../components/FeedSkeleton';
import EmptyState from '../components/EmptyState';
import { postAPI } from '../api/api';

const PAGE_LIMIT = 10;

// Main social feed page: create-post card, paginated list of posts,
// and a "Load More" button. Owns all post state so likes/comments/new
// posts can update the UI instantly without a full refetch.
export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchPosts = useCallback(async (page = 1) => {
    try {
      const res = await postAPI.getPosts(page, PAGE_LIMIT);
      const { posts: newPosts } = res.data.data;
      setPagination(res.data.pagination);
      setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
      setLoadError('');
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Could not load the feed. Please try again.');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchPosts(1);
      setIsLoading(false);
    };
    load();
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    if (!pagination?.hasNextPage) return;
    setIsLoadingMore(true);
    await fetchPosts(pagination.currentPage + 1);
    setIsLoadingMore(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setPagination((prev) => (prev ? { ...prev, totalPosts: prev.totalPosts + 1 } : prev));
  };

  const handlePostUpdated = (postId, updates) => {
    setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, ...updates } : post)));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />

      <Box
        sx={{
          maxWidth: 680,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 4 },
        }}
      >
        <CreatePost onPostCreated={handlePostCreated} onNotify={showNotification} />

        {isLoading && <FeedSkeleton count={3} />}

        {!isLoading && loadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}

        {!isLoading && !loadError && posts.length === 0 && <EmptyState />}

        {!isLoading &&
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onNotify={showNotification}
            />
          ))}

        {!isLoading && pagination?.hasNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        )}

        {!isLoading && pagination && !pagination.hasNextPage && posts.length > 0 && (
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1, mb: 3 }}>
            You're all caught up.
          </Typography>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
