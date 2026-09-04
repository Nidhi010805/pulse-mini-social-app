import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../api/api';
import { formatDate, getInitials, stringToColor } from '../utils/formatDate';
import CommentSection from './CommentSection';

// A single post in the feed: header (avatar/username/time), text/image
// content, and a like/comment action row with an expandable comment list.
export default function PostCard({ post, onPostUpdated, onNotify }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = post.likes.some((like) => like.user === user?.id || like.user?._id === user?.id);

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update so the like feels instant.
    const previousLikes = post.likes;
    const optimisticLikes = isLiked
      ? previousLikes.filter((like) => like.user !== user.id)
      : [...previousLikes, { user: user.id, username: user.username }];
    onPostUpdated(post._id, { likes: optimisticLikes });

    try {
      const res = await postAPI.toggleLike(post._id);
      onPostUpdated(post._id, { likes: res.data.data.likes });
    } catch (err) {
      onPostUpdated(post._id, { likes: previousLikes });
      onNotify?.(err.response?.data?.message || 'Could not update like', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = (postId, comments) => {
    onPostUpdated(postId, { comments });
  };

  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              fontWeight: 700,
              fontSize: 15,
              bgcolor: stringToColor(post.username),
            }}
          >
            {getInitials(post.username)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {post.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
        </Box>

        {post.text && (
          <Typography variant="body1" sx={{ mb: post.image ? 1.5 : 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.text}
          </Typography>
        )}

        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt="Post attachment"
            loading="lazy"
            sx={{
              width: '100%',
              maxHeight: 480,
              objectFit: 'cover',
              borderRadius: 3,
              mb: 1,
            }}
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Button
            size="small"
            onClick={handleToggleLike}
            startIcon={
              isLiked ? (
                <FavoriteRoundedIcon fontSize="small" sx={{ color: '#EF4444' }} />
              ) : (
                <FavoriteBorderRoundedIcon fontSize="small" />
              )
            }
            sx={{
              color: isLiked ? '#EF4444' : 'text.secondary',
              fontWeight: 600,
              '&:hover': { backgroundColor: 'rgba(239,68,68,0.08)' },
            }}
          >
            {post.likes.length}
          </Button>

          <Button
            size="small"
            onClick={() => setShowComments((prev) => !prev)}
            startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            {post.comments.length}
          </Button>
        </Box>

        {showComments && (
          <CommentSection
            postId={post._id}
            comments={post.comments}
            onCommentAdded={handleCommentAdded}
            onNotify={onNotify}
          />
        )}
      </CardContent>
    </Card>
  );
}
