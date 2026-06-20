import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

/**
 * Success Dialog component for conversation creation
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when closing the dialog
 * @param {Object} props.data - Success data from the creation process
 * @param {string} props.data.conversationId - The ID of the created conversation
 * @param {string} props.data.blobId - The Walrus blob ID
 * @param {string} [props.data.encryptionId] - Seal encryption ID (if applicable)
 * @param {string} [props.data.encryptionKey] - Simple encryption key (if applicable)
 * @param {string} props.data.mode - Encryption mode ('Simple', 'Allowlist', 'Subscription')
 * @param {string} [props.data.price] - Subscription price (if applicable)
 */
export default function ConversationSuccessDialog({ open, onClose, data }) {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/conversations');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="h6">Created Successfully!</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Conversation Details
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all', mb: 1 }}>
              <strong>Conversation ID:</strong> {data?.conversationId}
            </Typography>
            <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all', mb: 1 }}>
              <strong>Blob ID:</strong> {data?.blobId}
            </Typography>
            {data?.encryptionId && (
              <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all', mb: 1 }}>
                <strong>Encryption ID:</strong> {data?.encryptionId}
              </Typography>
            )}
            {data?.encryptionKey && (
              <Box sx={{ mt: 2, p: 1, bgcolor: '#fff9c4', border: '1px dashed #fbc02d', borderRadius: 1 }}>
                <Typography variant="body2" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ⚠️ Encryption Key (Save this!):
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', userSelect: 'all' }}>
                  {data?.encryptionKey}
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<ContentCopyIcon />} 
                  sx={{ mt: 1 }}
                  onClick={() => copyToClipboard(data?.encryptionKey)}
                >
                  Copy Key
                </Button>
              </Box>
            )}
          </Box>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Privacy & Security
          </Typography>
          <Box sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: data?.mode === 'Simple' ? 'info.light' : 'success.light', 
            color: '#fff' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Mode: {data?.mode}
            </Typography>
            {data?.mode === 'Allowlist' && (
              <Typography variant="body2">
                ✅ You have been automatically added to the access whitelist.
              </Typography>
            )}
            {data?.mode === 'Subscription' && (
              <Typography variant="body2">
                💰 Users can view after paying {data?.price} SUI.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          color="primary"
        >
          Go to My Conversations
        </Button>
      </DialogActions>
    </Dialog>
  );
}
