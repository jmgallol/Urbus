import { useEffect, useState } from 'react';
import {
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  Box,
  InputAdornment,
  Typography,
} from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken,
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from '../common/components/NativeInterface';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    zIndex: 2,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  link: {
    cursor: 'pointer',
    color: '#94A3B8',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#2563EB',
    }
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },
  logoText: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: 800,
    fontSize: '2.5rem',
    background: 'linear-gradient(90deg, #2563EB 0%, #0891B2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
    lineHeight: 1.2,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '0.85rem',
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: '#E2E8F0',
        transition: 'border-color 0.3s',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(226, 232, 240, 0.7)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#94A3B8',
      '&.Mui-focused': {
        color: '#2563EB',
      },
    },
    '& .MuiIconButton-root': {
      color: '#94A3B8',
    }
  },
  loginButton: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: '12px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
    '&:hover': {
      backgroundColor: '#1D4ED8',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
      transform: 'translateY(-2px)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(37, 99, 235, 0.5)',
      color: 'rgba(15, 23, 42, 0.5)',
    }
  },
  selectFormControl: {
    '& .MuiOutlinedInput-root': {
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: '#E2E8F0',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(226, 232, 240, 0.7)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
    '& .MuiSvgIcon-root': {
      color: '#94A3B8',
    }
  },
  iconButton: {
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    '&:hover': {
      backgroundColor: '#E2E8F0',
      color: '#0F172A',
    }
  },
  animatedButton: {
    position: 'relative',
    padding: '12px 40px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    background: 'rgba(37, 99, 235, 0.1)',
    border: '1px solid rgba(37, 99, 235, 0.3)',
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
      background: 'rgba(37, 99, 235, 0.15)',
      borderColor: '#2563EB',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  registerButton: {
    padding: '8px 24px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#94A3B8',
    background: 'transparent',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    width: 'auto',
    marginTop: theme.spacing(1.5),
    fontFamily: 'inherit',
    display: 'block',
    margin: `${theme.spacing(1.5)} auto 0`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#2563EB',
      color: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
    },
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, transparent 0%, #2563EB 20%, #0891B2 50%, #2563EB 80%, transparent 100%)',
    animation: '$slideRight 2s linear infinite',
    borderRadius: '10px 10px 0 0',
    boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
    backgroundSize: '200% 100%',
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '3px',
    height: '100%',
    background: 'linear-gradient(180deg, transparent 0%, #2563EB 20%, #0891B2 50%, #2563EB 80%, transparent 100%)',
    animation: '$slideDown 2s linear infinite 0.5s',
    borderRadius: '0 10px 10px 0',
    boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
    backgroundSize: '100% 200%',
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(270deg, transparent 0%, #2563EB 20%, #0891B2 50%, #2563EB 80%, transparent 100%)',
    animation: '$slideLeft 2s linear infinite 1s',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
    backgroundSize: '200% 100%',
  },
  borderLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '3px',
    height: '100%',
    background: 'linear-gradient(360deg, transparent 0%, #2563EB 20%, #0891B2 50%, #2563EB 80%, transparent 100%)',
    animation: '$slideUp 2s linear infinite 1.5s',
    borderRadius: '10px 0 0 10px',
    boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
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

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector(
    (state) => state.session.server.openIdEnabled && state.session.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetchOrThrow(`/api/session?token=${encodeURIComponent(token)}`);
    const user = await response.json();
    dispatch(sessionActions.updateUser(user));
    navigate('/');
  });

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <IconButton className={classes.iconButton} onClick={() => navigate('/change-server')}>
            <Tooltip
              title={`${t('settingsServer')}: ${window.location.hostname}`}
              open={showServerTooltip}
              arrow
            >
              <VpnLockIcon />
            </Tooltip>
          </IconButton>
        )}
        {!nativeEnvironment && (
          <IconButton className={classes.iconButton} onClick={() => setShowQr(true)}>
            <QrCode2Icon />
          </IconButton>
        )}
        {languageEnabled && (
          <FormControl className={classes.selectFormControl} size="small">
            <Select value={language} onChange={(e) => setLocalLanguage(e.target.value)}>
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  <Box component="span" sx={{ mr: 1 }}>
                    <ReactCountryFlag countryCode={it.country} svg />
                  </Box>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <div className={classes.container}>
        {!openIdForced && (
          <>
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
              error={failed}
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={failed && t('loginInvalidCredentials')}
              className={classes.textField}
            />
            <TextField
              required
              error={failed}
              label={t('userPassword')}
              name="password"
              value={password}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus={!!email}
              onChange={(e) => setPassword(e.target.value)}
              className={classes.textField}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {codeEnabled && (
              <TextField
                required
                error={failed}
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                onChange={(e) => setCode(e.target.value)}
                className={classes.textField}
              />
            )}
            <button
              onClick={handlePasswordLogin}
              type="submit"
              className={classes.animatedButton}
              disabled={!email || !password || (codeEnabled && !code)}
            >
              <span className={classes.borderTop} />
              <span className={classes.borderRight} />
              <span className={classes.borderBottom} />
              <span className={classes.borderLeft} />
              <span className={classes.btnText}>{t('loginLogin')}</span>
            </button>
            {!openIdForced && (
              <button
                onClick={() => navigate('/register')}
                type="button"
                className={classes.registerButton}
              >
                {t('loginRegister')}
              </button>
            )}
          </>
        )}
        {openIdEnabled && (
          <Button onClick={() => handleOpenIdLogin()} variant="outlined" className={classes.loginButton} sx={{ backgroundColor: 'transparent', color: '#2563EB', border: '1px solid #2563EB', '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' } }}>
            {t('loginOpenId')}
          </Button>
        )}
        {!openIdForced && (
          <div className={classes.extraContainer}>
            {registrationEnabled && (
              <Link
                onClick={() => navigate('/register')}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t('loginRegister')}
              </Link>
            )}
            {emailEnabled && (
              <Link
                onClick={() => navigate('/reset-password')}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t('loginReset')}
              </Link>
            )}
          </div>
        )}
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LoginLayout>
  );
};

export default LoginPage;
