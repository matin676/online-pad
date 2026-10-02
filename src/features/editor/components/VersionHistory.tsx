import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { History, RotateCcw, X, Clock } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface Version {
  id: string;
  content: string;
  savedAt: Timestamp;
  charCount: number;
}

interface VersionHistoryProps {
  slug: string;
  currentText: string;
  onRestore: (content: string) => void;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  slug,
  currentText,
  onRestore,
  open: controlledOpen,
  onClose: controlledOnClose,
  hideTrigger = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleClose = () => {
    setSelectedVersion(null);
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const handleOpen = () => {
    if (!isControlled) {
      setInternalOpen(true);
    }
  };

  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (!open) return;

    const versionsRef = collection(db, 'documents', slug, 'versions');
    const q = query(versionsRef, orderBy('savedAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const versionList: Version[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Version[];
      setVersions(versionList);
    });

    return () => unsubscribe();
  }, [slug, open]);

  const formatTimestamp = (timestamp: Timestamp): string => {
    if (!timestamp?.toDate) return 'Unknown';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.content);
      handleClose();
    }
  };

  return (
    <>
      {!hideTrigger && (
        <Tooltip title="Version history">
          <IconButton onClick={handleOpen} color="default">
            <History size={20} />
          </IconButton>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 360 },
            bgcolor: 'background.default',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History size={20} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Version History
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <X size={20} />
          </IconButton>
        </Box>

        <Divider />

        {versions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Clock size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              No saved versions yet.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
              Versions are saved automatically as you edit.
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
              {versions.map((version) => (
                <ListItemButton
                  key={version.id}
                  selected={selectedVersion?.id === version.id}
                  onClick={() => setSelectedVersion(version)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiTypography-root': { color: 'inherit' },
                      '& .MuiChip-root': { bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemText
                    primary={formatTimestamp(version.savedAt)}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={`${version.charCount.toLocaleString()} chars`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" component="span" sx={{ color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {version.content.substring(0, 60)}{version.content.length > 60 ? '…' : ''}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                  />
                </ListItemButton>
              ))}
            </List>

            {selectedVersion && (
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {/* Preview */}
                <Typography variant="caption" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    maxHeight: 200,
                    overflowY: 'auto',
                    mb: 2,
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedVersion.content || <em style={{ opacity: 0.5 }}>Empty document</em>}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<RotateCcw size={16} />}
                  onClick={handleRestore}
                  sx={{ borderRadius: 2 }}
                >
                  Restore this version
                </Button>
              </Box>
            )}
          </>
        )}
      </Drawer>
    </>
  );
};
