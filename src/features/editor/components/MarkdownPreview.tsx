import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, Divider } from '@mui/material';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <Box sx={{ 
      height: '100%', 
      overflowY: 'auto', 
      px: 3,
      py: 1,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: theme => theme.palette.mode === 'light' ? '#e0e0e0' : '#444',
        borderRadius: '4px',
      },
      '& img': {
        maxWidth: '100%',
        borderRadius: 2
      },
      '& code': {
        bgcolor: 'action.hover',
        p: 0.5,
        borderRadius: 1,
        fontFamily: 'monospace'
      },
      '& pre': {
        bgcolor: 'action.hover',
        p: 2,
        borderRadius: 2,
        overflowX: 'auto'
      },
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
        mb: 2
      },
      '& th, & td': {
        border: '1px solid',
        borderColor: 'divider',
        p: 1
      }
    }}>
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', mt: 2 }}>
          Nothing to preview...
        </Typography>
      )}
    </Box>
  );
};
