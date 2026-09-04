import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../api/api';
import { formatDate, getInitials, stringToColor } from '../utils/formatDate';

// Collapsible comment list + input, rendered inside each PostCard.
// Adding a comment updates the parent post's comments instantly.
export default function CommentSection({ postId, comments, onCommentAdded, onNotify }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const res = await postAPI.addComment(postId, trimmed);
      onCommentAdded(postId, res.data.data.comments);
      setCommentText('');
    } catch (err) {
      onNotify?.(err.response?.data?.message || 'Could not add comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Divider sx={{ mb: 1.5 }} />

      {comments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.5 }}>
          {comments.map((comment, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1 }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: stringToColor(comment.username),
                }}
              >
                {getInitials(comment.username)}
              </Avatar>
              <Box
                sx={{
                  backgroundColor: '#F5F7FB',
                  borderRadius: 2.5,
                  px: 1.5,
                  py: 0.75,
                  flex: 1,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  {comment.username}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {comment.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: stringToColor(user?.username || ''),
          }}
        >
          {getInitials(user?.username)}
        </Avatar>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a thoughtful comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <IconButton
          color="primary"
          onClick={handleAddComment}
          disabled={isSubmitting || !commentText.trim()}
        >
          {isSubmitting ? <CircularProgress size={18} /> : <SendRoundedIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}
