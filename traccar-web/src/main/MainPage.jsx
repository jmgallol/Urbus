import { useState, useCallback, useEffect } from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import CheckpointsDrawer from './CheckpointsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import MainMap from './MainMap';
import { useAttributePreference } from '../common/util/preferences';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Base layer for Map
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 3,
    [theme.breakpoints.up('md')]: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(4)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      padding: theme.spacing(2),
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
    borderRadius: '16px',
    overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    marginBottom: theme.spacing(2),
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
    marginTop: theme.spacing(2),
    borderRadius: '16px',
    backdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    pointerEvents: 'none',
  },
  contentList: {
    pointerEvents: 'auto',
    flex: 1,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: '16px',
    overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [checkpointsOpen, setCheckpointsOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState(null);
  const [checkpointFormOpen, setCheckpointFormOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  const handleEditCheckpoint = useCallback((checkpoint) => {
    setEditingCheckpoint(checkpoint);
    setCheckpointFormOpen(true);
    setCheckpointsOpen(false); // Cerrar drawer cuando se abre el formulario
  }, []);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  return (
    <div className={classes.root}>
      {/* Map spans the entire background on both desktop and mobile */}
      <div className={classes.mapContainer}>
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
          checkpointFormOpen={checkpointFormOpen}
          setCheckpointFormOpen={setCheckpointFormOpen}
          editingCheckpoint={editingCheckpoint}
          setEditingCheckpoint={setEditingCheckpoint}
        />
      </div>

      <div className={classes.sidebar}>
        <Paper elevation={0} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
            checkpointFormOpen={checkpointFormOpen}
            setCheckpointFormOpen={setCheckpointFormOpen}
            checkpointsOpen={checkpointsOpen}
            setCheckpointsOpen={setCheckpointsOpen}
          />
        </Paper>
        <div className={classes.middle}>
          <Paper
            elevation={0}
            className={classes.contentList}
            style={devicesOpen ? {} : { visibility: 'hidden', flex: 0 }}
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <CheckpointsDrawer
        open={checkpointsOpen}
        onClose={() => setCheckpointsOpen(false)}
        onEditCheckpoint={handleEditCheckpoint}
      />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
