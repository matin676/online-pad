import React from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  Tooltip,
  useTheme 
} from '@mui/material';
import { Sun, Moon, Palette } from 'lucide-react';
import { ThemeMode, AccentColor } from '../../theme';

interface ThemeToggleProps {
  mode: ThemeMode;
  accent: AccentColor;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (accent: AccentColor) => void;
}

const colors: { label: string; value: AccentColor; hex: string }[] = [
  { label: 'Royal Purple', value: 'purple', hex: '#6750A4' },
  { label: 'Deep Blue', value: 'blue', hex: '#0061A4' },
  { label: 'Forest Green', value: 'green', hex: '#006D32' },
  { label: 'Wild Rose', value: 'rose', hex: '#9C4275' },
  { label: 'Sunset Orange', value: 'orange', hex: '#8B5000' },
];

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  mode, 
  accent, 
  onModeChange, 
  onAccentChange 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton onClick={() => onModeChange(mode === 'light' ? 'dark' : 'light')} color="default">
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Customize accent color">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="default" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          <Palette size={20} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { mt: 1.5, borderRadius: 2, minWidth: 180 }
        }}
      >
        {colors.map((c) => (
          <MenuItem 
            key={c.value} 
            onClick={() => {
              onAccentChange(c.value);
              setAnchorEl(null);
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              bgcolor: accent === c.value ? 'action.selected' : 'transparent'
            }}
          >
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.hex }} />
            {c.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
