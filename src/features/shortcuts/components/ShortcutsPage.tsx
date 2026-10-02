import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Keyboard,
  ArrowLeft,
  Search,
  Eye,
  Hash,
  Maximize,
  Indent,
  Outdent,
  X,
  Laptop,
  Apple,
  CloudCheck,
  MousePointer2,
  Smartphone,
  Code2,
  Sparkles,
  BookOpen,
  Check,
} from 'lucide-react';
import { ThemeMode, AccentColor } from '../../../theme';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { RecentPads } from '../../../components/common/RecentPads';

interface ShortcutsPageProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

interface KeyCombo {
  keys: string[];
  label?: string;
}

interface ShortcutItem {
  id: string;
  category: 'essential' | 'view' | 'editing';
  categoryLabel: string;
  icon: React.ReactNode;
  action: string;
  description: string;
  winCombos: KeyCombo[];
  macCombos: KeyCombo[];
  keywords: string[];
}

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="kbd"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
      height: 26,
      px: 1,
      fontSize: '0.74rem',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontWeight: 600,
      color: 'text.primary',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#252932' : '#ffffff'),
      border: '1px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : '#d2d6dc',
      borderRadius: '6px',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 2px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 2px 0 #cbd0dc, 0 1px 2px rgba(0, 0, 0, 0.06)',
      letterSpacing: '0.01em',
      lineHeight: 1,
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Box>
);

const allShortcuts: ShortcutItem[] = [
  {
    id: 'save',
    category: 'essential',
    categoryLabel: 'Essential',
    icon: <CloudCheck size={18} />,
    action: 'Save Status Confirmation',
    description: 'Confirms continuous auto-save & prevents browser save dialog',
    winCombos: [{ keys: ['Ctrl', 'S'] }],
    macCombos: [{ keys: ['⌘ Cmd', 'S'] }],
    keywords: ['save', 'cloud', 'autosave', 'status', 'disk', 'ctrl+s'],
  },
  {
    id: 'find',
    category: 'essential',
    categoryLabel: 'Essential',
    icon: <Search size={18} />,
    action: 'Find & Replace',
    description: 'Toggle search and replace toolbar across the current note',
    winCombos: [
      { keys: ['Ctrl', 'H'] },
      { label: 'or', keys: ['Ctrl', 'Shift', 'F'] },
    ],
    macCombos: [
      { keys: ['⌘ Cmd', 'H'] },
      { label: 'or', keys: ['⌘ Cmd', 'Shift', 'F'] },
    ],
    keywords: ['find', 'search', 'replace', 'lookup', 'text'],
  },
  {
    id: 'close',
    category: 'essential',
    categoryLabel: 'Essential',
    icon: <X size={18} />,
    action: 'Close Panels / Exit Zen',
    description: 'Dismiss Find & Replace toolbar or exit Zen full-screen mode',
    winCombos: [{ keys: ['Esc'] }],
    macCombos: [{ keys: ['Esc'] }],
    keywords: ['close', 'escape', 'dismiss', 'exit', 'cancel'],
  },
  {
    id: 'preview',
    category: 'view',
    categoryLabel: 'View & Display',
    icon: <Eye size={18} />,
    action: 'Markdown Live Preview',
    description: 'Toggle formatted live side-by-side Markdown render view',
    winCombos: [
      { keys: ['Ctrl', 'Shift', 'P'] },
      { label: 'or', keys: ['Alt', 'P'] },
    ],
    macCombos: [
      { keys: ['⌘ Cmd', 'Shift', 'P'] },
      { label: 'or', keys: ['⌥ Opt', 'P'] },
    ],
    keywords: ['markdown', 'preview', 'split', 'render', 'html', 'live', 'alt+p'],
  },
  {
    id: 'linenumbers',
    category: 'view',
    categoryLabel: 'View & Display',
    icon: <Hash size={18} />,
    action: 'Line Numbers Gutter',
    description: 'Toggle editor line numbers margin on or off',
    winCombos: [
      { keys: ['Ctrl', 'Shift', 'L'] },
      { label: 'or', keys: ['Alt', 'L'] },
    ],
    macCombos: [
      { keys: ['⌘ Cmd', 'Shift', 'L'] },
      { label: 'or', keys: ['⌥ Opt', 'L'] },
    ],
    keywords: ['line', 'numbers', 'gutter', 'margin', 'lines', 'alt+l'],
  },
  {
    id: 'zen',
    category: 'view',
    categoryLabel: 'View & Display',
    icon: <Maximize size={18} />,
    action: 'Zen Mode (Distraction-Free)',
    description: 'Toggle full-screen focus editor without navigation or distraction',
    winCombos: [
      { keys: ['F11'] },
      { label: 'or', keys: ['Alt', 'Z'] },
      { label: 'or', keys: ['Ctrl', 'Shift', 'Z'] },
    ],
    macCombos: [
      { keys: ['⌘ Cmd', 'Shift', 'Z'] },
      { label: 'or', keys: ['⌥ Opt', 'Z'] },
      { label: 'or', keys: ['F11'] },
    ],
    keywords: ['zen', 'fullscreen', 'focus', 'maximize', 'distraction', 'f11'],
  },
  {
    id: 'indent',
    category: 'editing',
    categoryLabel: 'Text & Code',
    icon: <Indent size={18} />,
    action: 'Indent Text (2 Spaces)',
    description: 'Insert 2-space tab indent without losing editor focus',
    winCombos: [{ keys: ['Tab'] }],
    macCombos: [{ keys: ['Tab'] }],
    keywords: ['tab', 'indent', 'spaces', 'spacing', 'code'],
  },
  {
    id: 'outdent',
    category: 'editing',
    categoryLabel: 'Text & Code',
    icon: <Outdent size={18} />,
    action: 'Outdent Text',
    description: 'Remove 2 spaces from start of selected lines',
    winCombos: [{ keys: ['Shift', 'Tab'] }],
    macCombos: [{ keys: ['Shift', 'Tab'] }],
    keywords: ['outdent', 'unindent', 'shift+tab', 'dedent'],
  },
];

const markdownCheatSheet = [
  { syntax: '# Heading 1', preview: 'Largest document title' },
  { syntax: '## Heading 2', preview: 'Section header' },
  { syntax: '### Heading 3', preview: 'Sub-section header' },
  { syntax: '**bold text**', preview: 'Bold styling' },
  { syntax: '*italic text*', preview: 'Italic emphasis' },
  { syntax: '~~strikethrough~~', preview: 'Crossed-out text' },
  { syntax: '`code inline`', preview: 'Inline code snippet' },
  { syntax: '```js ... ```', preview: 'Syntax-highlighted code block' },
  { syntax: '- [ ] Todo item', preview: 'Interactive checklist' },
  { syntax: '> Blockquote', preview: 'Callout quote' },
  { syntax: '[Link text](url)', preview: 'Clickable hyperlink' },
  { syntax: '| Col 1 | Col 2 |', preview: 'Formatted Markdown table' },
];

export const ShortcutsPage: React.FC<ShortcutsPageProps> = (props) => {
  const navigate = useNavigate();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
  const [platform, setPlatform] = useState<'windows' | 'mac'>(isMac ? 'mac' : 'windows');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'essential' | 'view' | 'editing'>('all');

  const filteredShortcuts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allShortcuts.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        s.action.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'transparent',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderWidth: 1.5,
                px: 1.75,
              }}
            >
              Home
            </Button>

            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Box
                sx={{
                  p: 0.6,
                  bgcolor: 'primary.main',
                  borderRadius: 1.5,
                  display: 'flex',
                  color: 'white',
                }}
              >
                <MousePointer2 size={18} />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'inline-block' },
                }}
              >
                Online Pad
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RecentPads />
            <ThemeToggle {...props} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 3, sm: 4.5 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Header Hero */}
        <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 3, sm: 4.5 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: '14px',
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}35`,
              mb: 1.5,
            }}
          >
            <Keyboard size={28} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.65rem', sm: '2.15rem', md: '2.35rem' },
              lineHeight: 1.25,
              mb: 1,
            }}
          >
            Keyboard Shortcuts & Instructions
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.88rem', sm: '0.98rem' },
              lineHeight: 1.5,
              maxWidth: 540,
              mx: 'auto',
            }}
          >
            Speed up your editing, toggle views instantly, and format Markdown like a pro.
          </Typography>
        </Box>

        {/* Controls Toolbar (Search, Filter Tabs, OS Switcher) */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 3.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Search shortcuts (e.g. preview, save, f11)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              width: { xs: '100%', md: 360 },
              flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              gap: 1.25,
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Category Filter Chips */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'essential', label: 'Essential' },
                  { id: 'view', label: 'View' },
                  { id: 'editing', label: 'Editing' },
                ] as const
              ).map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  size="small"
                  onClick={() => setSelectedCategory(cat.id)}
                  color={selectedCategory === cat.id ? 'primary' : 'default'}
                  variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                  }}
                />
              ))}
            </Box>

            {/* Platform Toggle */}
            <ToggleButtonGroup
              value={platform}
              exclusive
              onChange={(_, p) => p && setPlatform(p)}
              size="small"
              sx={{
                bgcolor: 'action.hover',
                borderRadius: '10px',
                alignSelf: { xs: 'flex-start', sm: 'auto' },
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.45,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  gap: 0.6,
                  borderRadius: '10px',
                  border: 'none',
                  '&.Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: 1,
                  },
                },
              }}
            >
              <ToggleButton value="windows">
                <Laptop size={14} />
                Windows / Linux
              </ToggleButton>
              <ToggleButton value="mac">
                <Apple size={14} />
                macOS
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>

        {/* Shortcuts List Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Editor Shortcuts ({filteredShortcuts.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Showing {platform === 'mac' ? 'macOS' : 'Windows & Linux'} bindings
            </Typography>
          </Box>

          {filteredShortcuts.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Search size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                No shortcuts found for "{searchQuery}"
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Try searching for "preview", "save", "line", or switch categories.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              {filteredShortcuts.map((item) => {
                const combos = platform === 'mac' ? item.macCombos : item.winCombos;
                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: { xs: 1.75, sm: 2 },
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '0 4px 16px rgba(0, 0, 0, 0.35)'
                            : '0 4px 16px rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {/* Left: Icon & Info */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '10px',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(103, 80, 164, 0.16)'
                              : 'rgba(103, 80, 164, 0.08)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: 'text.primary',
                              lineHeight: 1.3,
                            }}
                          >
                            {item.action}
                          </Typography>
                          <Chip
                            label={item.categoryLabel}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: 'action.hover',
                              color: 'text.secondary',
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.78rem',
                            mt: 0.3,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: Key Combos */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: { xs: 'center', sm: 'flex-end' },
                        justifyContent: 'center',
                        gap: 0.75,
                        flexShrink: 0,
                        flexWrap: 'wrap',
                        width: { xs: '100%', sm: 'auto' },
                        pt: { xs: 1, sm: 0 },
                        borderTop: { xs: '1px dashed', sm: 'none' },
                        borderColor: 'divider',
                      }}
                    >
                      {combos.map((combo, cIdx) => (
                        <Box
                          key={cIdx}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {combo.label && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.7rem',
                                color: 'text.disabled',
                                fontStyle: 'italic',
                                mr: 0.3,
                                userSelect: 'none',
                              }}
                            >
                              {combo.label}
                            </Typography>
                          )}
                          {combo.keys.map((k, kIdx) => (
                            <React.Fragment key={kIdx}>
                              {kIdx > 0 && (
                                <Typography
                                  component="span"
                                  sx={{
                                    color: 'text.disabled',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    mx: 0.1,
                                    userSelect: 'none',
                                  }}
                                >
                                  +
                                </Typography>
                              )}
                              <Kbd>{k}</Kbd>
                            </React.Fragment>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Two-Column Reference: Markdown Syntax & Mobile Instructions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 6,
          }}
        >
          {/* Markdown Quick Cheat Sheet */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.75 },
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 165, 233, 0.1)',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7',
                  display: 'flex',
                }}
              >
                <Code2 size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Markdown Formatting Guide
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Use these in your pad for instant rich styling
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.25,
              }}
            >
              {markdownCheatSheet.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    component="code"
                    sx={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: 'primary.main',
                    }}
                  >
                    {item.syntax}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    {item.preview}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Mobile & Touch Instructions */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.75 },
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#c084fc' : '#9333ea',
                    display: 'flex',
                  }}
                >
                  <Smartphone size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Mobile & Tablet Gestures
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    No hardware keyboard needed on mobile devices
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ color: 'primary.main', mt: 0.3 }}>
                    <Check size={18} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Mobile Action Menu
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Tap the <strong>Menu</strong> icon in the top-right corner to access Markdown Preview, Line Numbers, Font Size, Find & Replace, and QR Code sharing.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ color: 'primary.main', mt: 0.3 }}>
                    <Check size={18} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      QR Code Instant Handoff
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Scan the room's QR Code from your phone camera to transfer notes between your laptop and mobile device in real-time.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ color: 'primary.main', mt: 0.3 }}>
                    <Check size={18} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Continuous Auto-Save
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Edits save automatically to the cloud as you type. Your work is safe even if your browser closes or device disconnects.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Ready to write banner */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Ready to try out these shortcuts in action?
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/')}
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  px: 2,
                }}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
