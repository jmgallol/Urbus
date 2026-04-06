import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#020617', // Deep navy/black
    backgroundImage: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(94, 234, 212, 0.15), transparent 40%)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Slate 900 with transparency
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 60%)',
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
    background: 'radial-gradient(circle, rgba(94, 234, 212, 0.12) 0%, transparent 60%)',
    filter: 'blur(80px)',
    zIndex: 0,
    pointerEvents: 'none',
  }
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();

  return (
    <main className={classes.root}>
      <div className={classes.orb1} />
      <div className={classes.orb2} />
      <div className={classes.content}>
        <div className={classes.formContainer}>
          {children}
        </div>
      </div>
    </main>
  );
};

export default LoginLayout;
