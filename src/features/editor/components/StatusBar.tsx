import React from 'react';
import { Box, Typography, IconButton, Tooltip, Slider } from '@mui/material';
import { Minus, Plus, Type } from 'lucide-react';

interface StatusBarProps {
  text: string;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isLocked: boolean;
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;
const FONT_STEP = 2;

export const StatusBar: React.FC<StatusBarProps> = ({ text, fontSize, onFontSizeChange, isLocked }) => {
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lineCount = text === '' ? 0 : text.split('\n').length;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, md: 3 },
        py: 0.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minHeight: 36,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {/* Stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
          {wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
          {charCount.toLocaleString()} char{charCount !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums', display: { xs: 'none', sm: 'block' } }}>
          {lineCount.toLocaleString()} line{lineCount !== 1 ? 's' : ''}
        </Typography>
        {isLocked && (
          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
            READ-ONLY
          </Typography>
        )}
      </Box>

      {/* Font size controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Decrease font size">
          <span>
            <IconButton
              size="small"
              onClick={() => onFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - FONT_STEP))}
              disabled={fontSize <= MIN_FONT_SIZE}
              sx={{ minWidth: 28, minHeight: 28 }}
            >
              <Minus size={14} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Font size">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 48, justifyContent: 'center' }}>
            <Type size={12} style={{ opacity: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
              {fontSize}px
            </Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Increase font size">
          <span>
            <IconButton
              size="small"
              onClick={() => onFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + FONT_STEP))}
              disabled={fontSize >= MAX_FONT_SIZE}
              sx={{ minWidth: 28, minHeight: 28 }}
            >
              <Plus size={14} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};
