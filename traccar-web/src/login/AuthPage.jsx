import { useState, useEffect } from 'react';
import {
    useMediaQuery,
    Select,
    MenuItem,
    FormControl,
    Button,
    TextField,
    Snackbar,
    IconButton,
    Tooltip,
    Box,
    InputAdornment,
    Typography,
    Switch,
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
import { useCatch, useEffectAsync } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { snackBarDurationShortMs } from '../common/util/duration';

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
    toggleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(2),
        marginBottom: theme.spacing(2),
        position: 'relative',
        zIndex: 1,
    },
    toggleLabel: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#0F172A',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        '&.active': {
            color: '#2563EB',
        },
        '&.inactive': {
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'color 0.3s',
            '&:hover': {
                color: '#475569',
            },
        },
    },
    muiSwitch: {
        '& .MuiSwitch-switchBase': {
            color: '#2563EB',
            '&.Mui-checked': {
                color: '#2563EB',
            },
            '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'rgba(37, 99, 235, 0.3)',
            },
        },
        '& .MuiSwitch-track': {
            backgroundColor: 'rgba(148, 163, 184, 0.2)',
        },
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(3),
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
    animatedButton: {
        position: 'relative',
        padding: '14px 48px',
        fontSize: '1.05rem',
        fontWeight: 800,
        color: '#fff',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(8, 145, 178, 0.7) 100%)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: '2.5px',
        width: '100%',
        marginTop: theme.spacing(2),
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 0 20px rgba(37, 99, 235, 0.6), 0 0 40px rgba(8, 145, 178, 0.3)',
        '&:hover': {
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 1) 0%, rgba(8, 145, 178, 0.85) 100%)',
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.9), 0 0 60px rgba(8, 145, 178, 0.5), 0 4px 20px rgba(37, 99, 235, 0.4)',
            transform: 'translateY(-2px)',
            animation: '$pulse 1.5s ease-in-out infinite',
        },
        '&:active': {
            transform: 'translateY(0px)',
        },
        '&:disabled': {
            opacity: 0.4,
            cursor: 'not-allowed',
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.2)',
            animation: 'none',
        },
    },
    '@keyframes pulse': {
        '0%': {
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.9), 0 0 60px rgba(8, 145, 178, 0.5), 0 4px 20px rgba(37, 99, 235, 0.4)',
        },
        '50%': {
            boxShadow: '0 0 40px rgba(37, 99, 235, 1), 0 0 80px rgba(8, 145, 178, 0.7), 0 4px 25px rgba(37, 99, 235, 0.6)',
        },
        '100%': {
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.9), 0 0 60px rgba(8, 145, 178, 0.5), 0 4px 20px rgba(37, 99, 235, 0.4)',
        },
    },
    selectFormControl: {
        '& .MuiOutlinedInput-root': {
            color: '#0F172A',
            backgroundColor: '#FFFFFF',
            backdropFilter: 'blur(8px)',
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
        backdropFilter: 'blur(8px)',
        '&:hover': {
            backgroundColor: '#E2E8F0',
            color: '#0F172A',
        }
    },
    btnText: {
        position: 'relative',
        zIndex: 10,
    },
}));

const AuthPage = () => {
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

    const [isLogin, setIsLogin] = useState(true);
    const [failed, setFailed] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Login fields
    const [email, setEmail] = usePersistedState('loginEmail', '');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showServerTooltip, setShowServerTooltip] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [codeEnabled, setCodeEnabled] = useState(false);

    // Register fields
    const [name, setName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [totpKey, setTotpKey] = useState(null);
    const [announcementShown, setAnnouncementShown] = useState(false);

    const server = useSelector((state) => state.session.server);
    const totpForce = useSelector((state) => state.session.server.attributes.totpForce);
    const registrationEnabled = useSelector((state) => state.session.server.registration);
    const languageEnabled = useSelector((state) => {
        const attributes = state.session.server.attributes;
        return !attributes.language && !attributes['ui.disableLoginLanguage'];
    });
    const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
    const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
    const openIdForced = useSelector(
        (state) => state.session.server.openIdEnabled && state.session.server.openIdForce,
    );
    const announcement = useSelector((state) => state.session.server.announcement);

    useEffectAsync(async () => {
        if (totpForce) {
            const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
            setTotpKey(await response.text());
        }
    }, [totpForce]);

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

    const handleRegister = useCatch(async (event) => {
        event.preventDefault();
        await fetchOrThrow('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email: regEmail, password: regPassword, totpKey }),
        });
        setSnackbarOpen(true);
    });

    const handleOpenIdLogin = () => {
        document.location = '/api/session/openid/auth';
    };

    useEffect(() => nativePostMessage('authentication'), []);

    const handleTokenLogin = useCatch(async (token) => {
        const response = await fetchOrThrow(`/api/session?token=${encodeURIComponent(token)}`);
        const user = await response.json();
        dispatch(sessionActions.updateUser(user));
        navigate('/');
    });

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

            <div className={classes.toggleContainer}>
                <Typography className={`${classes.toggleLabel} ${isLogin ? 'active' : 'inactive'}`}>
                    {t('loginLogin')}
                </Typography>
                <Switch
                    checked={!isLogin}
                    onChange={(e) => setIsLogin(!e.target.checked)}
                    className={classes.muiSwitch}
                />
                <Typography className={`${classes.toggleLabel} ${!isLogin ? 'active' : 'inactive'}`}>
                    {t('loginRegister')}
                </Typography>
            </div>

            <div className={classes.container}>
                <Box className={classes.logoContainer}>
                    <Typography className={classes.logoText} component="h1">
                        URBUS
                    </Typography>
                    <Typography className={classes.subtitle}>
                        {t('appSubtitle')}
                    </Typography>
                </Box>

                {isLogin ? (
                    <>
                        <TextField
                            required
                            error={failed}
                            label={t('userEmail')}
                            name="email"
                            value={email}
                            autoComplete="email"
                            autoFocus
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
                            <span className={classes.btnText}>{t('loginLogin')}</span>
                        </button>
                    </>
                ) : (
                    <>
                        <TextField
                            required
                            label={t('sharedName')}
                            name="name"
                            value={name}
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setName(e.target.value)}
                            className={classes.textField}
                        />
                        <TextField
                            required
                            type="email"
                            label={t('userEmail')}
                            name="email"
                            value={regEmail}
                            autoComplete="email"
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={classes.textField}
                        />
                        <TextField
                            required
                            label={t('userPassword')}
                            name="password"
                            value={regPassword}
                            type="password"
                            autoComplete="current-password"
                            onChange={(e) => setRegPassword(e.target.value)}
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
                            onClick={handleRegister}
                            type="submit"
                            className={classes.animatedButton}
                            disabled={!name || !regPassword || !/(.+)@(.+)\.(.{2,})/.test(regEmail)}
                        >
                            <span className={classes.btnText}>{t('loginRegister')}</span>
                        </button>
                    </>
                )}

                {openIdEnabled && (
                    <Button onClick={() => handleOpenIdLogin()} variant="outlined" sx={{ backgroundColor: 'transparent', color: '#2563EB', border: '1px solid #2563EB', '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' } }}>
                        {t('loginOpenId')}
                    </Button>
                )}
            </div>

            <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
            <Snackbar
                open={snackbarOpen}
                onClose={() => {
                    setIsLogin(true);
                    setSnackbarOpen(false);
                }}
                autoHideDuration={snackBarDurationShortMs}
                message={t('loginCreated')}
            />
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

export default AuthPage;
