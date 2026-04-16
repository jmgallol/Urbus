import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server) => ({
  mode: 'light',
  background: {
    default: '#FAFBFF', // General light background
    paper: '#FFFFFF', // White surfaces
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || '#2563EB', // Official URBUS blue
    light: '#DBEAFE',
    lighter: '#EFF6FF',
    dark: '#1D4ED8',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || '#0891B2', // URBUS Teal - UI accents
    light: '#CFFAFE',
  },
  error: {
    main: '#EF4444',
    light: '#FEF2F2',
  },
  warning: {
    main: '#F97316',
    light: '#FFF7ED',
  },
  info: { main: '#0891B2' },
  success: {
    main: '#10B981',
    light: '#D1FAE5',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
  },
  neutral: {
    main: '#94A3B8',
  },
  geometry: {
    main: '#0891B2',
  },
  divider: '#E2E8F0',
  alwaysDark: {
    main: '#0F172A',
  },
});
