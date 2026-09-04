import { useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../api/api';
import { getInitials, stringToColor } from '../utils/formatDate';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Card at the top of the feed used to compose a new post: text, image,
// or both. Handles client-side validation, preview, and submission.
export default function CreatePost({ onPostCreated, onNotify }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are supported');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !imageFile) {
      setError('Write something or add an image to post');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('text', trimmedText);
      if (imageFile) formData.append('image', imageFile);

      const res = await postAPI.createPost(formData);
      onPostCreated(res.data.data.post);

      setText('');
      handleRemoveImage();
      onNotify?.('Post created successfully', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong while posting';
      setError(message);
      onNotify?.(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: stringToColor(user?.username || ''),
              width: 44,
              height: 44,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {getInitials(user?.username)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
            />

            {imagePreview && (
              <Box sx={{ position: 'relative', mt: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Selected preview"
                  sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(17,24,39,0.6)',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'rgba(17,24,39,0.8)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {error && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                {error}
              </Typography>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
              }}
            >
              <Button
                component="label"
                startIcon={<ImageOutlinedIcon />}
                color="inherit"
                size="small"
                disabled={isSubmitting}
                sx={{ color: 'text.secondary' }}
              >
                Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                />
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || (!text.trim() && !imageFile)}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendRoundedIcon fontSize="small" />
                  )
                }
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
