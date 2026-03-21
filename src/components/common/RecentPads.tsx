import React from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { History, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentPads: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [recents, setRecents] = React.useState<string[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const list = JSON.parse(localStorage.getItem('onlinepad-recents') || '[]');
    setRecents(list);
  }, []); // Run on mount

  const removeRecent = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newList = recents.filter(s => s !== slug);
    localStorage.setItem('onlinepad-recents', JSON.stringify(newList));
    setRecents(newList);
  };

  return (
    <Box>
      <Tooltip title="Recent Pads">
        <IconButton 
          onClick={(e) => {
            const list = JSON.parse(localStorage.getItem('onlinepad-recents') || '[]');
            setRecents(list);
            setAnchorEl(e.currentTarget);
          }} 
          color="default"
          aria-label="recent-pads"
        >
          <History size={20} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { mt: 1.5, borderRadius: 2, minWidth: 220, maxHeight: 300 }
        }}
      >
        <Typography variant="overline" sx={{ px: 2, py: 1, color: 'text.disabled', display: 'block' }}>
          Recent Documents
        </Typography>
        
        {recents.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No recent pads</Typography>
          </MenuItem>
        ) : (
          recents.map((slug) => (
            <MenuItem 
              key={slug} 
              onClick={() => {
                navigate(`/${slug}`);
                setAnchorEl(null);
              }}
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <FileText size={16} />
                </ListItemIcon>
                <ListItemText 
                  primary={slug} 
                  primaryTypographyProps={{ variant: 'body2', noWrap: true, sx: { maxWidth: 120 } }} 
                />
              </Box>
              <IconButton 
                size="small" 
                onClick={(e) => removeRecent(slug, e)}
                sx={{ ml: 1, opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <X size={14} />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};
