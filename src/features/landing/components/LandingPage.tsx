import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  IconButton,
  Paper,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import { ArrowRight, MousePointer2 } from 'lucide-react';
import { ThemeMode, AccentColor } from '../../../theme';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { RecentPads } from '../../../components/common/RecentPads';

interface LandingPageProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

export const LandingPage: React.FC<LandingPageProps> = (props) => {
  const [slug, setSlug] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      navigate(`/${slug.trim()}`);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100dvh', 
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
          <RecentPads />
          <ThemeToggle {...props} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ 
        flexGrow: 1,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        pb: { xs: 4, md: 8 }
      }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex' }}>
            <MousePointer2 color="white" size={28} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Online Pad
          </Typography>
        </Box>

        <Typography variant="h2" gutterBottom sx={{ 
          fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
          color: 'text.primary',
          fontWeight: 700,
          lineHeight: 1.2
        }}>
          Collaborate in <span style={{ color: 'var(--mui-palette-primary-main, #6750A4)', whiteSpace: 'nowrap' }}>Real-Time.</span>
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary', maxWidth: '400px', fontSize: { xs: '1rem', md: '1.1rem' }, px: 2 }}>
          No accounts. No setup. Just pick a URL and start typing with your team.
        </Typography>

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
              boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}33` 
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, ml: { xs: 1, sm: 2 } }}>
            <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              onlinepad.com/
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 500, display: { xs: 'block', sm: 'none' }, px: 0.5 }}>
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
                style: { fontWeight: 500, color: 'var(--mui-palette-text-primary)' } 
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
              justifyContent: 'center'
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline-block' } }}>Get Started</Box>
            <Box component="span" sx={{ display: { xs: 'inline-flex', sm: 'none' }, alignItems: 'center' }}>
              <ArrowRight size={20} />
            </Box>
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
