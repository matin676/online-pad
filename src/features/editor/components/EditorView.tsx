import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Divider,
  Switch,
  Chip,
  Button,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import {
  Share2,
  CloudCheck,
  CloudOff,
  MousePointer2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldAlert,
  Copy,
  Search,
  Download,
  Upload,
  Timer,
  Maximize,
  Minimize,
  Hash,
  Menu as MenuIcon,
  X,
  FileText,
  Clock,
  Sun,
  Moon,
  QrCode,
  History,
} from 'lucide-react';
import { useDocument, ExpiryOption } from '../hooks/useDocument';
import { ThemeMode, AccentColor } from '../../../theme';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { RecentPads } from '../../../components/common/RecentPads';
import { PresenceIndicator } from './PresenceIndicator';
import { MarkdownPreview } from './MarkdownPreview';
import { FindReplace } from './FindReplace';
import { StatusBar } from './StatusBar';
import { VersionHistory } from './VersionHistory';
import { QRShare } from './QRShare';

interface EditorViewProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────

const MONOSPACE_FONT =
  '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const copyToClipboard = async (content: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // fall through to legacy fallback
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = content;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, content.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

const expiryLabels: Record<ExpiryOption, string> = {
  never: 'Never',
  '1h': '1 Hour',
  '24h': '24 Hours',
  '7d': '7 Days',
};

// ── Component ────────────────────────────────────────────────────────

export const EditorView: React.FC<EditorViewProps> = (props) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { text, isLocked, updateDocument, toggleLock, syncStatus, expiresAt, setExpiry } =
    useDocument(slug || 'default');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showPreview, setShowPreview] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(() => localStorage.getItem('onlinepad-linenums') === 'true');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('onlinepad-fontsize') || '16', 10));
  const [zenMode, setZenMode] = useState(false);
  const [expiryMenuAnchor, setExpiryMenuAnchor] = useState<null | HTMLElement>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrShareOpen, setQrShareOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('onlinepad-linenums', String(showLineNumbers));
  }, [showLineNumbers]);

  useEffect(() => {
    localStorage.setItem('onlinepad-fontsize', String(fontSize));
  }, [fontSize]);

  // Track recent pads
  useEffect(() => {
    if (slug) {
      const recents: string[] = JSON.parse(localStorage.getItem('onlinepad-recents') || '[]');
      const filtered = recents.filter((s) => s !== slug);
      const newList = [slug, ...filtered].slice(0, 10);
      localStorage.setItem('onlinepad-recents', JSON.stringify(newList));
    }
  }, [slug]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code;

      // Ctrl+S / Cmd+S — force save (prevent browser save dialog)
      if (ctrlOrMeta && (key === 's' || code === 'KeyS') && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        showToast('Document auto-saves continuously', 'success');
        return;
      }

      // Ctrl+H or Ctrl+Shift+F — Find & Replace
      if (
        (ctrlOrMeta && !e.shiftKey && (key === 'h' || code === 'KeyH')) ||
        (ctrlOrMeta && e.shiftKey && (key === 'f' || code === 'KeyF'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowFindReplace((prev) => !prev);
        return;
      }

      // Ctrl+Shift+P / Cmd+Shift+P or Alt+P — Toggle preview
      if (
        (ctrlOrMeta && e.shiftKey && (key === 'p' || code === 'KeyP')) ||
        (e.altKey && (key === 'p' || code === 'KeyP'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowPreview((prev) => !prev);
        return;
      }

      // Ctrl+Shift+L / Cmd+Shift+L or Alt+L — Toggle line numbers
      if (
        (ctrlOrMeta && e.shiftKey && (key === 'l' || code === 'KeyL')) ||
        (e.altKey && (key === 'l' || code === 'KeyL'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowLineNumbers((prev) => !prev);
        return;
      }

      // F11 or Ctrl+Shift+Z / Cmd+Shift+Z or Alt+Z — Zen mode
      if (
        code === 'F11' ||
        e.key === 'F11' ||
        (ctrlOrMeta && e.shiftKey && (key === 'z' || code === 'KeyZ')) ||
        (e.altKey && (key === 'z' || code === 'KeyZ'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setZenMode((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  // ── Tab key support ────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !isLocked) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const indent = '  '; // 2-space indent

      if (e.shiftKey) {
        // Outdent: remove leading spaces from each selected line
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = end;
        const selectedBlock = val.substring(lineStart, lineEnd);
        const outdented = selectedBlock.replace(/^  /gm, '');
        const diff = selectedBlock.length - outdented.length;
        const newText = val.substring(0, lineStart) + outdented + val.substring(lineEnd);
        updateDocument(newText);
        requestAnimationFrame(() => {
          textarea.selectionStart = Math.max(lineStart, start - (diff > 0 ? 2 : 0));
          textarea.selectionEnd = end - diff;
        });
      } else {
        // Insert tab
        const newText = val.substring(0, start) + indent + val.substring(end);
        updateDocument(newText);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + indent.length;
        });
      }
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDocument(e.target.value);
  };

  const showToast = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyUrl = async () => {
    const ok = await copyToClipboard(window.location.href);
    showToast(ok ? 'URL copied to clipboard!' : 'Failed to copy URL', ok ? 'success' : 'error');
  };

  const copyContent = async () => {
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Content copied to clipboard!' : 'Failed to copy content', ok ? 'success' : 'error');
  };

  const handleFindReplaceUpdate = useCallback(
    (newText: string) => {
      updateDocument(newText);
    },
    [updateDocument],
  );

  const handleVersionRestore = useCallback(
    (content: string) => {
      updateDocument(content);
      showToast('Version restored!', 'success');
    },
    [updateDocument],
  );

  // ── Sync gutter scroll with textarea ───────────────────────────────
  const handleTextareaScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    if (showLineNumbers && textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [showLineNumbers, fontSize, showPreview]);

  useEffect(() => {
    const handleResize = () => {
      if (showLineNumbers && textareaRef.current && gutterRef.current) {
        gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showLineNumbers]);

  // ── Download ───────────────────────────────────────────────────────
  const downloadFile = (ext: 'txt' | 'md') => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'document'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded as .${ext}`, 'success');
  };

  // ── File import ────────────────────────────────────────────────────
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content !== null && content !== undefined) {
        updateDocument(content);
        showToast(`Imported "${file.name}"`, 'success');
      }
    };
    reader.onerror = () => showToast('Failed to read file', 'error');
    reader.readAsText(file);

    // Reset so re-importing the same file works
    e.target.value = '';
  };

  // ── Drag & drop import ────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (isLocked) return;
      const file = e.dataTransfer.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content !== null && content !== undefined) {
          updateDocument(content);
          showToast(`Imported "${file.name}"`, 'success');
        }
      };
      reader.readAsText(file);
    },
    [isLocked, updateDocument],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ── Line numbers ───────────────────────────────────────────────────
  const lineCount = text.split('\n').length;

  // ── Expiry display ─────────────────────────────────────────────────
  const getExpiryLabel = (): string | null => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `Expires in ${days}d`;
    if (hours > 0) return `Expires in ${hours}h`;
    const mins = Math.floor(diff / 60000);
    return `Expires in ${mins}m`;
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100dvh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".txt,.md,.markdown,.text,.csv,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp,.h,.go,.rs,.rb,.php,.sh,.yml,.yaml,.toml,.ini,.cfg,.log"
        style={{ display: 'none' }}
      />

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      {!zenMode && (
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'transparent',
            borderBottom: '1px solid',
            borderColor: 'divider',
            transition: 'border-color 0.3s ease',
          }}
        >
          <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: 48, sm: 54 }, justifyContent: 'space-between', gap: 1 }}>
            {/* Logo, slug, sync & status badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: { xs: 0.5, sm: 1 }, flexShrink: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/')}
              >
                <MousePointer2 size={18} style={{ marginRight: 6 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: 'primary.main', display: { xs: 'none', sm: 'block' } }}
                >
                  Online Pad
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  maxWidth: { xs: 80, sm: 140, md: 'auto' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                /{slug}
              </Typography>

              {/* Sync status */}
              <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: { xs: 0.25, sm: 0.5 } }}>
                {syncStatus === 'ready' ? (
                  <Tooltip title="Saved to cloud">
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <CloudCheck size={18} color="#4CAF50" />
                    </span>
                  </Tooltip>
                ) : syncStatus === 'syncing' ? (
                  <Tooltip title="Saving...">
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <CircularProgress size={14} />
                    </span>
                  </Tooltip>
                ) : syncStatus === 'connecting' ? (
                  <Tooltip title="Connecting...">
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <CircularProgress size={16} />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Connection error">
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <CloudOff size={18} color="#F44336" />
                    </span>
                  </Tooltip>
                )}
              </Box>

              {/* Expiry badge */}
              {expiresAt && (
                <Tooltip title={`This pad ${getExpiryLabel()?.toLowerCase()}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'warning.main',
                      px: { xs: 0.75, sm: 1 },
                      py: 0.25,
                      borderRadius: 1,
                      color: 'warning.contrastText',
                      ml: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <Timer size={12} style={{ marginRight: 3 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      {getExpiryLabel()}
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              {/* Read-only badge */}
              {isLocked && (
                <Tooltip title="This document is read-only">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'error.main',
                      px: { xs: 0.75, sm: 1 },
                      py: 0.25,
                      borderRadius: 1,
                      color: 'white',
                      ml: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <ShieldAlert size={12} style={{ marginRight: 3 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      READ-ONLY
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>

            {/* Desktop Actions (md and up: >= 900px) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Tooltip title={isLocked ? 'Unlock document' : 'Lock document (Read-Only)'}>
                <IconButton onClick={toggleLock} color={isLocked ? 'error' : 'default'}>
                  {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                </IconButton>
              </Tooltip>

              <Tooltip title={showPreview ? 'Hide Preview (Ctrl+Shift+P / Alt+P)' : 'Markdown Preview (Ctrl+Shift+P / Alt+P)'}>
                <IconButton
                  onClick={() => setShowPreview(!showPreview)}
                  color={showPreview ? 'primary' : 'default'}
                >
                  {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Find & Replace (Ctrl+H)">
                <IconButton
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  color={showFindReplace ? 'primary' : 'default'}
                >
                  <Search size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title={showLineNumbers ? 'Hide line numbers (Ctrl+Shift+L / Alt+L)' : 'Show line numbers (Ctrl+Shift+L / Alt+L)'}>
                <IconButton
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  color={showLineNumbers ? 'primary' : 'default'}
                >
                  <Hash size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Copy all content">
                <IconButton onClick={copyContent} color="default">
                  <Copy size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Download">
                <IconButton onClick={(e) => setDownloadMenuAnchor(e.currentTarget)} color="default">
                  <Download size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title={isLocked ? 'Import disabled (read-only)' : 'Import file'}>
                <span>
                  <IconButton onClick={() => fileInputRef.current?.click()} color="default" disabled={isLocked}>
                    <Upload size={20} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Set auto-expiry">
                <IconButton onClick={(e) => setExpiryMenuAnchor(e.currentTarget)} color="default">
                  <Timer size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Share URL">
                <IconButton onClick={copyUrl} color="primary">
                  <Share2 size={20} />
                </IconButton>
              </Tooltip>

              <QRShare slug={slug || 'default'} />

              <VersionHistory
                slug={slug || 'default'}
                currentText={text}
                onRestore={handleVersionRestore}
              />

              <Tooltip title={zenMode ? 'Exit Zen mode (F11 / Alt+Z)' : 'Zen mode (F11 / Alt+Z)'}>
                <IconButton onClick={() => setZenMode(!zenMode)}>
                  {zenMode ? <Minimize size={20} /> : <Maximize size={20} />}
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  ml: 0.5,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  pl: 0.5,
                  display: 'flex',
                  gap: 0,
                  alignItems: 'center',
                }}
              >
                <PresenceIndicator slug={slug || 'default'} />
                <RecentPads />
                <ThemeToggle {...props} />
              </Box>
            </Box>

            {/* Mobile / Tablet Actions (< 900px, xs & sm) */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: { xs: 0.25, sm: 0.75 },
                flexShrink: 0,
              }}
            >
              {/* Quick Action: Copy */}
              <Tooltip title="Copy all content">
                <IconButton onClick={copyContent} color="default" size="small">
                  <Copy size={18} />
                </IconButton>
              </Tooltip>

              {/* Quick Action: Markdown Preview */}
              <Tooltip title={showPreview ? 'Switch to Editor' : 'Markdown Preview'}>
                <IconButton
                  onClick={() => setShowPreview(!showPreview)}
                  color={showPreview ? 'primary' : 'default'}
                  size="small"
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </Tooltip>

              {/* Theme Toggle */}
              <ThemeToggle {...props} />

              {/* Mobile Menu Button: Opens full menu with all labeled options */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setMobileMenuOpen(true)}
                startIcon={<MenuIcon size={18} />}
                sx={{
                  borderRadius: 2,
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  minWidth: 'auto',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Menu
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Zen mode exit button */}
      {zenMode && (
        <Tooltip title="Exit Zen mode (F11)">
          <IconButton
            onClick={() => setZenMode(false)}
            sx={{
              position: 'fixed',
              top: 8,
              right: 8,
              zIndex: 1300,
              bgcolor: 'background.paper',
              boxShadow: 2,
              opacity: 0.4,
              '&:hover': { opacity: 1 },
            }}
          >
            <Minimize size={18} />
          </IconButton>
        </Tooltip>
      )}

      {/* ── Find & Replace panel ───────────────────────────────── */}
      <FindReplace
        open={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        text={text}
        onReplace={handleFindReplaceUpdate}
        textareaRef={textareaRef}
      />

      {/* ── Editor area ────────────────────────────────────────── */}
      <Container
        disableGutters
        maxWidth={showPreview ? 'xl' : 'lg'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          py: { xs: 1, md: zenMode ? 4 : 3 },
          px: { xs: 1, md: zenMode ? 6 : 3 },
          gap: { xs: 1, md: 3 },
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Editor pane */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            display: showPreview ? { xs: 'none', md: 'flex' } : 'flex',
            flexDirection: 'row',
          }}
        >
          {/* Line numbers gutter */}
          {showLineNumbers && (
            <Box
              ref={gutterRef}
              onWheel={handleGutterWheel}
              sx={{
                pr: 1.5,
                mr: 1.5,
                borderRight: '1px solid',
                borderColor: 'divider',
                overflowY: 'hidden',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                pt: 0,
                pb: '120px',
                fontFamily: MONOSPACE_FONT,
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                color: 'text.disabled',
                minWidth: `${Math.max(2, String(lineCount).length) * 0.7 + 0.5}em`,
                flexShrink: 0,
                height: '100%',
              }}
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </Box>
          )}

          {/* Textarea */}
          <Box sx={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={handleTextareaScroll}
              placeholder={isLocked ? 'This pad is locked...' : 'Start typing...'}
              disabled={isLocked}
              autoFocus={!isLocked}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              data-gramm="false"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                fontFamily: MONOSPACE_FONT,
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                color: 'inherit',
                padding: 0,
                margin: 0,
                opacity: isLocked ? 0.7 : 1,
                caretColor: 'auto',
              }}
            />
          </Box>
        </Box>

        {/* Markdown preview pane */}
        {showPreview && (
          <Box
            sx={{
              flex: { xs: 1, md: 0.8 },
              height: '100%',
              overflow: 'hidden',
              animation: 'fadeIn 0.3s ease',
              borderLeft: { xs: 'none', md: '1px solid' },
              borderColor: 'divider',
              pl: { xs: 0, md: 3 },
            }}
          >
            <MarkdownPreview content={text} />
          </Box>
        )}
      </Container>

      {/* ── Status bar ──────────────────────────────────────────── */}
      {!zenMode && (
        <StatusBar text={text} fontSize={fontSize} onFontSizeChange={setFontSize} isLocked={isLocked} />
      )}

      {/* ── Download format menu ──────────────────────────────────── */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={() => setDownloadMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        <MenuItem onClick={() => { downloadFile('txt'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><Download size={16} /></ListItemIcon>
          <ListItemText>Download .txt</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { downloadFile('md'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><Download size={16} /></ListItemIcon>
          <ListItemText>Download .md</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Expiry menu ─────────────────────────────────────────── */}
      <Menu
        anchorEl={expiryMenuAnchor}
        open={Boolean(expiryMenuAnchor)}
        onClose={() => setExpiryMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        <Typography variant="overline" sx={{ px: 2, py: 0.5, color: 'text.disabled', display: 'block' }}>
          Auto-expire pad
        </Typography>
        {(Object.keys(expiryLabels) as ExpiryOption[]).map((opt) => (
          <MenuItem
            key={opt}
            onClick={() => {
              setExpiry(opt);
              setExpiryMenuAnchor(null);
              showToast(opt === 'never' ? 'Expiry removed' : `Pad will expire in ${expiryLabels[opt].toLowerCase()}`, 'success');
            }}
            selected={
              opt === 'never'
                ? !expiresAt
                : false
            }
          >
            <ListItemIcon><Timer size={16} /></ListItemIcon>
            <ListItemText>{expiryLabels[opt]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* ── Hidden controlled dialogs for mobile menu ─────────── */}
      <QRShare
        slug={slug || 'default'}
        open={qrShareOpen}
        onClose={() => setQrShareOpen(false)}
        hideTrigger
      />
      <VersionHistory
        slug={slug || 'default'}
        currentText={text}
        onRestore={handleVersionRestore}
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        hideTrigger
      />

      {/* ── Mobile Menu Drawer ──────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '85vw', sm: 350 },
            maxWidth: 380,
            bgcolor: 'background.paper',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <MousePointer2 size={20} color="var(--mui-palette-primary-main, #3b82f6)" />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                /{slug}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Options & Actions
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small" aria-label="Close menu">
            <X size={20} />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
          {/* Section 1: Actions & Share */}
          <Typography
            variant="overline"
            sx={{ px: 1.5, pt: 1, pb: 0.5, color: 'text.secondary', fontWeight: 700, display: 'block' }}
          >
            Actions & Sharing
          </Typography>
          <List dense disablePadding>
            {/* Copy All Content */}
            <ListItemButton
              onClick={() => {
                copyContent();
                setMobileMenuOpen(false);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                <Copy size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Copy All Content"
                secondary="Copy whole document text to clipboard"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>

            {/* Share Link */}
            <ListItemButton
              onClick={() => {
                copyUrl();
                setMobileMenuOpen(false);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                <Share2 size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Share Pad Link"
                secondary="Copy pad URL to share with others"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>

            {/* QR Code */}
            <ListItemButton
              onClick={() => {
                setMobileMenuOpen(false);
                setQrShareOpen(true);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                <QrCode size={20} />
              </ListItemIcon>
              <ListItemText
                primary="QR Code Share"
                secondary="Scan with phone or tablet camera to open"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>

            {/* Download */}
            <Box sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover', my: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  <Download size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Download Document"
                  secondary="Save to your device as text or markdown"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, pl: 5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    downloadFile('txt');
                    setMobileMenuOpen(false);
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                >
                  .txt file
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    downloadFile('md');
                    setMobileMenuOpen(false);
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                >
                  .md file
                </Button>
              </Box>
            </Box>

            {/* Import File */}
            <ListItemButton
              onClick={() => {
                setMobileMenuOpen(false);
                fileInputRef.current?.click();
              }}
              disabled={isLocked}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                <Upload size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Import File"
                secondary={isLocked ? 'Disabled (document is read-only)' : 'Load text or code file into editor'}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </List>

          <Divider sx={{ my: 1.5 }} />

          {/* Section 2: View & Editor Tools */}
          <Typography
            variant="overline"
            sx={{ px: 1.5, pt: 0.5, pb: 0.5, color: 'text.secondary', fontWeight: 700, display: 'block' }}
          >
            View & Editor Tools
          </Typography>
          <List dense disablePadding>
            {/* Markdown Preview */}
            <ListItem
              secondaryAction={
                <Switch
                  edge="end"
                  checked={showPreview}
                  onChange={() => setShowPreview(!showPreview)}
                  size="small"
                />
              }
              sx={{ borderRadius: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: showPreview ? 'primary.main' : 'text.primary' }}>
                {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
              </ListItemIcon>
              <ListItemText
                primary="Markdown Preview"
                secondary={showPreview ? 'Currently previewing markdown' : 'Show formatted preview'}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>

            {/* Find & Replace */}
            <ListItemButton
              onClick={() => {
                setShowFindReplace(true);
                setMobileMenuOpen(false);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                <Search size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Find & Replace"
                secondary="Search and replace text in document"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>

            {/* Line Numbers */}
            <ListItem
              secondaryAction={
                <Switch
                  edge="end"
                  checked={showLineNumbers}
                  onChange={() => setShowLineNumbers(!showLineNumbers)}
                  size="small"
                />
              }
              sx={{ borderRadius: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: showLineNumbers ? 'primary.main' : 'text.primary' }}>
                <Hash size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Line Numbers"
                secondary={showLineNumbers ? 'Visible in editor' : 'Hidden'}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>

            {/* Read-Only Lock */}
            <ListItem
              secondaryAction={
                <Switch
                  edge="end"
                  color="error"
                  checked={isLocked}
                  onChange={toggleLock}
                  size="small"
                />
              }
              sx={{ borderRadius: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isLocked ? 'error.main' : 'text.primary' }}>
                {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
              </ListItemIcon>
              <ListItemText
                primary={isLocked ? 'Unlock Document' : 'Lock (Read-Only)'}
                secondary={isLocked ? 'Document is locked against edits' : 'Anyone with link can edit'}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>

            {/* Zen Mode */}
            <ListItemButton
              onClick={() => {
                setZenMode(true);
                setMobileMenuOpen(false);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                <Maximize size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Zen Mode"
                secondary="Distraction-free full-screen editor"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </List>

          <Divider sx={{ my: 1.5 }} />

          {/* Section 3: Document Settings & History */}
          <Typography
            variant="overline"
            sx={{ px: 1.5, pt: 0.5, pb: 0.5, color: 'text.secondary', fontWeight: 700, display: 'block' }}
          >
            Document Settings & History
          </Typography>
          <List dense disablePadding>
            {/* Auto-Expiry */}
            <Box sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover', my: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  <Timer size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Auto-Expiry"
                  secondary={expiresAt ? `Pad ${getExpiryLabel()?.toLowerCase()}` : 'Pad never expires'}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pl: 5 }}>
                {(Object.keys(expiryLabels) as ExpiryOption[]).map((opt) => {
                  const isSelected = opt === 'never' ? !expiresAt : false;
                  return (
                    <Chip
                      key={opt}
                      label={expiryLabels[opt]}
                      size="small"
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => {
                        setExpiry(opt);
                        showToast(
                          opt === 'never'
                            ? 'Expiry removed'
                            : `Pad will expire in ${expiryLabels[opt].toLowerCase()}`,
                          'success',
                        );
                      }}
                      sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Version History */}
            <ListItemButton
              onClick={() => {
                setMobileMenuOpen(false);
                setVersionHistoryOpen(true);
              }}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                <History size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Version History"
                secondary="View past saves and restore revisions"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>

            {/* Recent Pads in Drawer */}
            <Box sx={{ px: 1.5, py: 1, borderRadius: 2, my: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  <Clock size={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Recent Documents"
                  secondary="Quickly switch to other pads"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Box>
              {(() => {
                const recents: string[] = JSON.parse(localStorage.getItem('onlinepad-recents') || '[]').filter(
                  (s: string) => s !== slug,
                );
                if (recents.length === 0) {
                  return (
                    <Typography variant="caption" sx={{ color: 'text.disabled', pl: 5, display: 'block' }}>
                      No other recent documents
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 5, mt: 0.5 }}>
                    {recents.slice(0, 5).map((r) => (
                      <Chip
                        key={r}
                        label={`/${r}`}
                        size="small"
                        icon={<FileText size={12} />}
                        clickable
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(`/${r}`);
                        }}
                        sx={{ borderRadius: 1.5, fontSize: '0.75rem', height: 26 }}
                      />
                    ))}
                  </Box>
                );
              })()}
            </Box>

            {/* Theme Toggle in Drawer */}
            <ListItem
              secondaryAction={
                <Switch
                  edge="end"
                  checked={props.mode === 'dark'}
                  onChange={() => props.onModeChange(props.mode === 'dark' ? 'light' : 'dark')}
                  size="small"
                />
              }
              sx={{ borderRadius: 2, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                {props.mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </ListItemIcon>
              <ListItemText
                primary={props.mode === 'dark' ? 'Dark Theme' : 'Light Theme'}
                secondary="Toggle application color scheme"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ── Snackbar ────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
