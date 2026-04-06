import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server) => ({
  mode: 'dark',
  background: {
    default: '#020617', // Very dark URBUS navy
    paper: 'rgba(15, 23, 42, 0.7)', // Translucent glassmorphism base
  },
  primary: {
    main:
      validatedColor(server?.attributes?.colorPrimary) || '#10B981', // URBUS Neon Emerald
  },
  secondary: {
    main:
      validatedColor(server?.attributes?.colorSecondary) || '#5EEAD4', // URBUS Cyan
  },
  error: { main: '#EF4444' },
  warning: { main: '#F97316' },
  info: { main: '#3bb2d0' },
  success: { main: '#10B981' },
  neutral: {
    main: '#94a3b8',
  },
  geometry: {
    main: '#5EEAD4',
  },
  alwaysDark: {
    main: '#020617',
  },
});
