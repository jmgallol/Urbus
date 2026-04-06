import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          h1: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
          h2: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
          h3: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
          h4: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
          h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
          h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
          button: { fontWeight: 600, textTransform: 'uppercase' },
        },
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
