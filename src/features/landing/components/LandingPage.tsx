import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ArrowRight,
  MousePointer2,
  Shuffle,
  Keyboard,
} from 'lucide-react';
import { ThemeMode, AccentColor } from '../../../theme';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { RecentPads } from '../../../components/common/RecentPads';

interface LandingPageProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

const generateRandomSlug = (): string => {
  const adjectives = [
    'swift', 'bright', 'calm', 'dark', 'eager', 'fair', 'glad', 'keen', 'neat',
    'warm', 'bold', 'cool', 'fast', 'kind', 'pure', 'rare', 'safe', 'vast', 'wise', 'zen',
  ];
  const nouns = [
    'fox', 'owl', 'elk', 'jay', 'bee', 'cod', 'ant', 'emu', 'yak', 'ram',
    'koi', 'bat', 'cat', 'dog', 'bear', 'dove', 'frog', 'hare', 'hawk', 'lynx',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${adj}-${noun}-${num}`;
};

export const LandingPage: React.FC<LandingPageProps> = (props) => {
  const [slug, setSlug] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      navigate(`/${slug.trim()}`);
    }
  };

  const handleRandomPad = () => {
    const randomSlug = generateRandomSlug();
    navigate(`/${randomSlug}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        height: '100%',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar sx={{ justifyContent: 'flex-end', gap: 1, px: { xs: 2, sm: 3 } }}>
          {/* Shortcuts Toolbar Node (Only on Home Page) */}
          <Tooltip title="Keyboard Shortcuts & Guide">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Keyboard size={17} />}
              onClick={() => navigate('/shortcuts')}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: { xs: 1.5, sm: 2 },
                py: 0.6,
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Keyboard Shortcuts
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Shortcuts
              </Box>
            </Button>
          </Tooltip>

          <RecentPads />
          <ThemeToggle {...props} />
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pt: { xs: 2, md: 4 },
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* Brand Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex' }}>
            <MousePointer2 color="white" size={28} />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: '1.75rem', md: '2.125rem' } }}
          >
            Online Pad
          </Typography>
        </Box>

        {/* Hero Title */}
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
            color: 'text.primary',
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Collaborate in{' '}
          <span style={{ color: 'var(--mui-palette-primary-main, #6750A4)', whiteSpace: 'nowrap' }}>
            Real-Time.
          </span>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '440px',
            fontSize: { xs: '1rem', md: '1.1rem' },
            px: 2,
          }}
        >
          No accounts. No setup. Just pick a URL and start typing with your team.
        </Typography>

        {/* Slug input form */}
        <Paper
          component="form"
          onSubmit={handleJoin}
          elevation={0}
          sx={{
            p: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            maxWidth: 500,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '50px',
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}33`,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, ml: { xs: 1, sm: 2 } }}>
            <Typography
              variant="body1"
              sx={{ color: 'text.disabled', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
            >
              onlinepad.com/
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.disabled', fontWeight: 500, display: { xs: 'block', sm: 'none' }, px: 0.5 }}
            >
              /
            </Typography>
            <TextField
              sx={{ flex: 1 }}
              placeholder="your-slug"
              variant="standard"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: { fontWeight: 500, color: 'var(--mui-palette-text-primary)' },
              }}
            />
          </Box>
          <Button
            variant="contained"
            type="submit"
            disabled={!slug.trim()}
            sx={{
              borderRadius: '50px',
              px: { xs: 2.5, sm: 4 },
              py: 1.2,
              minWidth: { xs: 'auto', sm: 120 },
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-block' } }}>
              Get Started
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline-flex', sm: 'none' }, alignItems: 'center' }}>
              <ArrowRight size={20} />
            </Box>
          </Button>
        </Paper>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', maxWidth: 500, my: 3 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
            or
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        </Box>

        {/* Random pad button */}
        <Button
          variant="outlined"
          startIcon={<Shuffle size={18} />}
          onClick={handleRandomPad}
          sx={{
            borderRadius: '50px',
            px: 4,
            py: 1.2,
            fontWeight: 600,
            textTransform: 'none',
            borderWidth: 2,
            '&:hover': { borderWidth: 2 },
          }}
        >
          Create Random Pad
        </Button>
      </Container>
    </Box>
  );
};
