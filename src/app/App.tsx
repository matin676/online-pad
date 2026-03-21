import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getTheme, ThemeMode, AccentColor } from '../theme';

// Lazy load features for performance (Code Splitting)
const LandingPage = lazy(() => import('../features/landing/components/LandingPage').then(m => ({ default: m.LandingPage })));
const EditorView = lazy(() => import('../features/editor/components/EditorView').then(m => ({ default: m.EditorView })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export const App: React.FC = () => {
  const [mode, setMode] = React.useState<ThemeMode>(
    (localStorage.getItem('onlinepad-mode') as ThemeMode) || 'light'
  );
  const [accent, setAccent] = React.useState<AccentColor>(
    (localStorage.getItem('onlinepad-accent') as AccentColor) || 'purple'
  );

  const theme = React.useMemo(() => getTheme(mode, accent), [mode, accent]);

  useEffect(() => {
    localStorage.setItem('onlinepad-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('onlinepad-accent', accent);
  }, [accent]);

  const themeProps = { mode, accent, onModeChange: setMode, onAccentChange: setAccent };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress color="primary" />
            </Box>
          }>
            <Routes>
              <Route path="/" element={<LandingPage {...themeProps} />} />
              <Route path="/:slug" element={<EditorView {...themeProps} />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
