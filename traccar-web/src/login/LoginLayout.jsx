import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FAFBFF',
    backgroundImage:
      'radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(8, 145, 178, 0.08), transparent 40%)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
    padding: theme.spacing(3),
  },
  formContainer: {
    maxWidth: '420px',
    width: '100%',
    padding: theme.spacing(5),
    borderRadius: '24px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.08), 0 0 20px rgba(29, 78, 216, 0.4), 0 0 40px rgba(29, 78, 216, 0.3), 0 0 80px rgba(29, 78, 216, 0.2)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4),
    },
  },
  orb1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 60%)',
    filter: 'blur(80px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(8, 145, 178, 0.08) 0%, transparent 60%)',
    filter: 'blur(80px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();

  return (
    <main className={classes.root}>
      <div className={classes.orb1} />
      <div className={classes.orb2} />
      <div className={classes.content}>
        <div className={classes.formContainer}>{children}</div>
      </div>
    </main>
  );
};

export default LoginLayout;
