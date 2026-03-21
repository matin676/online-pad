import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  TextField, 
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Share2, 
  CloudCheck, 
  CloudOff, 
  MousePointer2, 
  History, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { useDocument } from '../hooks/useDocument';
import { ThemeMode, AccentColor } from '../../../theme';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { RecentPads } from '../../../components/common/RecentPads';
import { PresenceIndicator } from './PresenceIndicator';
import { MarkdownPreview } from './MarkdownPreview';

interface EditorViewProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

export const EditorView: React.FC<EditorViewProps> = (props) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { text, isLocked, updateDocument, toggleLock, syncStatus } = useDocument(slug || 'default');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [showPreview, setShowPreview] = useState(false);

  React.useEffect(() => {
    if (slug) {
      const recents: string[] = JSON.parse(localStorage.getItem('onlinepad-recents') || '[]');
      const filtered = recents.filter(s => s !== slug);
      const newList = [slug, ...filtered].slice(0, 10);
      localStorage.setItem('onlinepad-recents', JSON.stringify(newList));
    }
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    updateDocument(newText);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({ open: true, message: 'URL copied to clipboard!' });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100dvh', 
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease'
    }}>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'transparent', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'border-color 0.3s ease'
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
             <MousePointer2 size={20} style={{ marginRight: 8 }} />
             <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', display: { xs: 'none', sm: 'block' } }}>
               Online Pad
             </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: { xs: 0, sm: 1 }, maxWidth: { xs: 100, sm: 'auto' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            /{slug}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {syncStatus === 'ready' ? (
              <Tooltip title="Saved to cloud">
                <CloudCheck size={20} color="#4CAF50" />
              </Tooltip>
            ) : syncStatus === 'connecting' ? (
              <CircularProgress size={20} />
            ) : (
              <CloudOff size={20} color="#F44336" />
            )}

            {isLocked && (
              <Tooltip title="This document is read-only">
                <Box sx={{ 
                  display: { xs: 'none', sm: 'flex' }, 
                  alignItems: 'center', 
                  bgcolor: 'error.main', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1, 
                  color: 'white',
                  ml: 1
                }}>
                  <ShieldAlert size={14} style={{ marginRight: 4 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>READ-ONLY</Typography>
                </Box>
              </Tooltip>
            )}
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isLocked ? "Unlock document" : "Lock document (Read-Only)"}>
                <IconButton onClick={toggleLock} color={isLocked ? "error" : "default"}>
                  {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={showPreview ? "Hide Preview" : "Show Markdown Preview"}>
                <IconButton onClick={() => setShowPreview(!showPreview)} color={showPreview ? "primary" : "default"}>
                  {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </Tooltip>

              <IconButton onClick={copyUrl} color="primary">
                <Share2 size={20} />
              </IconButton>
            </Box>

            {/* Mobile Actions Menu or Individual Icons for priority tasks */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0 }}>
               <IconButton onClick={() => setShowPreview(!showPreview)} color={showPreview ? "primary" : "default"}>
                  {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
               </IconButton>
               <IconButton onClick={copyUrl} color="primary">
                  <Share2 size={20} />
               </IconButton>
            </Box>

            <Box sx={{ ml: { xs: 0, sm: 1 }, borderLeft: { xs: 'none', sm: '1px solid' }, borderColor: 'divider', pl: { xs: 0, sm: 1 }, display: 'flex', gap: 0, alignItems: 'center' }}>
              <PresenceIndicator slug={slug || 'default'} />
              <RecentPads />
              <ThemeToggle {...props} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        disableGutters
        maxWidth={showPreview ? "xl" : "lg"} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          py: { xs: 1, md: 3 }, 
          px: { xs: 1, md: 3 },
          gap: { xs: 1, md: 3 },
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ 
          flex: 1, 
          height: '100%', 
          overflow: 'hidden',
          display: showPreview ? { xs: 'none', md: 'flex' } : 'flex',
          flexDirection: 'column'
        }}>
          <TextField
            multiline
            fullWidth
            value={text}
            onChange={handleChange}
            placeholder={isLocked ? "This pad is locked..." : "Start typing..."}
            variant="standard"
            autoFocus={!isLocked}
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
              style: { 
                fontFamily: '"Roboto Mono", monospace', 
                lineHeight: 1.6,
                alignItems: 'flex-start',
                height: '100%',
                opacity: isLocked ? 0.7 : 1
              }
            }}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '& .MuiInputBase-root': { 
                flexGrow: 1,
                alignItems: 'flex-start',
                padding: 0
              },
              '& .MuiInputBase-input': { 
                fontSize: { xs: '1rem', md: '1.125rem' },
                height: '100% !important',
                overflowY: 'auto !important',
                color: 'text.primary',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme => theme.palette.mode === 'light' ? '#e0e0e0' : '#444',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: theme => theme.palette.mode === 'light' ? '#bdbdbd' : '#666',
                },
              }
            }}
          />
        </Box>

        {showPreview && (
          <Box sx={{ 
            flex: { xs: 1, md: 0.8 }, 
            height: '100%', 
            overflow: 'hidden', 
            animation: 'fadeIn 0.3s ease',
            borderLeft: { xs: 'none', md: '1px solid' },
            borderColor: 'divider',
            pl: { xs: 0, md: 3 }
          }}>
            <MarkdownPreview content={text} />
          </Box>
        )}
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
