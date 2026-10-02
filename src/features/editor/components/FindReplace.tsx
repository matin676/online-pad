import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  Paper,
  Collapse,
  ToggleButton,
} from '@mui/material';
import {
  X,
  ChevronDown,
  ChevronUp,
  CaseSensitive,
  Replace,
  ReplaceAll,
} from 'lucide-react';

interface FindReplaceProps {
  open: boolean;
  onClose: () => void;
  text: string;
  onReplace: (newText: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const FindReplace: React.FC<FindReplaceProps> = ({
  open,
  onClose,
  text,
  onReplace,
  textareaRef,
}) => {
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchIndex, setMatchIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Focus the find input when panel opens
  useEffect(() => {
    if (open && findInputRef.current) {
      findInputRef.current.focus();
    }
  }, [open]);

  // Compute matches whenever find value or text changes
  useEffect(() => {
    if (!findValue) {
      setMatches([]);
      setMatchIndex(0);
      return;
    }

    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchTerm = caseSensitive ? findValue : findValue.toLowerCase();
    const indices: number[] = [];
    let pos = 0;

    while (pos < searchText.length) {
      const idx = searchText.indexOf(searchTerm, pos);
      if (idx === -1) break;
      indices.push(idx);
      pos = idx + 1;
    }

    setMatches(indices);
    setMatchIndex((prev) => (indices.length > 0 ? Math.min(prev, indices.length - 1) : 0));
  }, [findValue, text, caseSensitive]);

  // Scroll to and highlight the current match in the textarea
  const scrollToMatch = useCallback(
    (index: number) => {
      const textarea = textareaRef.current;
      if (!textarea || matches.length === 0) return;

      const matchStart = matches[index];
      const matchEnd = matchStart + findValue.length;

      textarea.focus();
      textarea.setSelectionRange(matchStart, matchEnd);

      // Scroll the match into view
      const fullText = textarea.value;
      const linesBefore = fullText.substring(0, matchStart).split('\n').length;
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
      textarea.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
    },
    [matches, findValue, textareaRef],
  );

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    const next = (matchIndex + 1) % matches.length;
    setMatchIndex(next);
    scrollToMatch(next);
  }, [matchIndex, matches.length, scrollToMatch]);

  const goToPrev = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (matchIndex - 1 + matches.length) % matches.length;
    setMatchIndex(prev);
    scrollToMatch(prev);
  }, [matchIndex, matches.length, scrollToMatch]);

  const replaceOne = useCallback(() => {
    if (matches.length === 0 || !findValue) return;
    const idx = matches[matchIndex];
    const newText = text.substring(0, idx) + replaceValue + text.substring(idx + findValue.length);
    onReplace(newText);
  }, [matches, matchIndex, findValue, replaceValue, text, onReplace]);

  const replaceAll = useCallback(() => {
    if (matches.length === 0 || !findValue) return;
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = findValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);
    const newText = text.replace(regex, replaceValue);
    onReplace(newText);
  }, [findValue, replaceValue, text, caseSensitive, matches.length, onReplace]);

  // Keyboard shortcuts within the find input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      goToPrev();
    }
  };

  return (
    <Collapse in={open}>
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        {/* Find row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          <TextField
            inputRef={findInputRef}
            size="small"
            placeholder="Find..."
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, '& .MuiInputBase-root': { borderRadius: 1.5 } }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', minWidth: 48, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
          >
            {matches.length > 0 ? `${matchIndex + 1}/${matches.length}` : '0/0'}
          </Typography>
          <Tooltip title="Previous match (Shift+Enter)">
            <span>
              <IconButton size="small" onClick={goToPrev} disabled={matches.length === 0}>
                <ChevronUp size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next match (Enter)">
            <span>
              <IconButton size="small" onClick={goToNext} disabled={matches.length === 0}>
                <ChevronDown size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Case sensitive">
            <ToggleButton
              value="case"
              selected={caseSensitive}
              onChange={() => setCaseSensitive(!caseSensitive)}
              size="small"
              sx={{ border: 'none', borderRadius: 1, minWidth: 32, minHeight: 32, p: 0.5 }}
            >
              <CaseSensitive size={16} />
            </ToggleButton>
          </Tooltip>
        </Box>

        {/* Replace row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          <TextField
            size="small"
            placeholder="Replace..."
            value={replaceValue}
            onChange={(e) => setReplaceValue(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, '& .MuiInputBase-root': { borderRadius: 1.5 } }}
          />
          <Tooltip title="Replace">
            <span>
              <IconButton size="small" onClick={replaceOne} disabled={matches.length === 0}>
                <Replace size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Replace all">
            <span>
              <IconButton size="small" onClick={replaceAll} disabled={matches.length === 0}>
                <ReplaceAll size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Tooltip title="Close (Esc)">
          <IconButton size="small" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </Tooltip>
      </Paper>
    </Collapse>
  );
};
