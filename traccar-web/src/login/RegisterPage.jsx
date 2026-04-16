import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Typography, Snackbar, IconButton, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationShortMs } from '../common/util/duration';
import { useCatch, useEffectAsync } from '../reactHelper';
import { sessionActions } from '../store';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  logoText: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 800,
    fontSize: '2.5rem',
    background: 'linear-gradient(90deg, #10B981 0%, #5EEAD4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
    lineHeight: 1.2,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: 'uppercase',
    color: '#f8fafc',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        transition: 'border-color 0.3s',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#10B981',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#94a3b8',
      '&.Mui-focused': {
        color: '#10B981',
      },
    },
  },
  animatedButton: {
    position: 'relative',
    padding: '12px 40px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    background: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    width: '100%',
    marginTop: theme.spacing(1),
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.8)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, transparent 0%, #10B981 20%, #5EEAD4 50%, #10B981 80%, transparent 100%)',
    animation: '$slideRight 2s linear infinite',
    borderRadius: '10px 10px 0 0',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
    backgroundSize: '200% 100%',
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '3px',
    height: '100%',
    background: 'linear-gradient(180deg, transparent 0%, #10B981 20%, #5EEAD4 50%, #10B981 80%, transparent 100%)',
    animation: '$slideDown 2s linear infinite 0.5s',
    borderRadius: '0 10px 10px 0',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
    backgroundSize: '100% 200%',
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(270deg, transparent 0%, #10B981 20%, #5EEAD4 50%, #10B981 80%, transparent 100%)',
    animation: '$slideLeft 2s linear infinite 1s',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
    backgroundSize: '200% 100%',
  },
  borderLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '3px',
    height: '100%',
    background: 'linear-gradient(360deg, transparent 0%, #10B981 20%, #5EEAD4 50%, #10B981 80%, transparent 100%)',
    animation: '$slideUp 2s linear infinite 1.5s',
    borderRadius: '10px 0 0 10px',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
    backgroundSize: '100% 200%',
  },
  btnText: {
    position: 'relative',
    zIndex: 10,
  },
  '@keyframes slideRight': {
    '0%': {
      backgroundPosition: '-200% 0',
    },
    '100%': {
      backgroundPosition: '200% 0',
    },
  },
  '@keyframes slideDown': {
    '0%': {
      backgroundPosition: '0 -200%',
    },
    '100%': {
      backgroundPosition: '0 200%',
    },
  },
  '@keyframes slideLeft': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
  '@keyframes slideUp': {
    '0%': {
      backgroundPosition: '0 200%',
    },
    '100%': {
      backgroundPosition: '0 -200%',
    },
  },
}));

const RegisterPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpKey, setTotpKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffectAsync(async () => {
    if (totpForce) {
      const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
      setTotpKey(await response.text());
    }
  }, [totpForce, setTotpKey]);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    await fetchOrThrow('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, totpKey }),
    });
    setSnackbarOpen(true);
  });

  return (
    <LoginLayout>
      <div className={classes.container}>
        <Box className={classes.logoContainer}>
          <Typography className={classes.logoText} component="h1">
            URBUS
          </Typography>
          <Typography className={classes.subtitle}>
            {t('appSubtitle')}
          </Typography>
        </Box>
        <TextField
          required
          label={t('sharedName')}
          name="name"
          value={name}
          autoComplete="name"
          autoFocus
          onChange={(event) => setName(event.target.value)}
          className={classes.textField}
        />
        <TextField
          required
          type="email"
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          className={classes.textField}
        />
        <TextField
          required
          label={t('userPassword')}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          className={classes.textField}
        />
        {totpForce && (
          <TextField
            required
            label={t('loginTotpKey')}
            name="totpKey"
            value={totpKey || ''}
            InputProps={{
              readOnly: true,
            }}
            className={classes.textField}
          />
        )}
        <button
          onClick={handleSubmit}
          type="submit"
          className={classes.animatedButton}
          disabled={!name || !password || !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))}
        >
          <span className={classes.borderTop} />
          <span className={classes.borderRight} />
          <span className={classes.borderBottom} />
          <span className={classes.borderLeft} />
          <span className={classes.btnText}>{t('loginRegister')}</span>
        </button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(sessionActions.updateServer({ ...server, newServer: false }));
          navigate('/login');
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t('loginCreated')}
      />
    </LoginLayout>
  );
};

export default RegisterPage;
