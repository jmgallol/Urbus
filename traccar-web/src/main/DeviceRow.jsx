import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import GeofencesValue from '../common/components/GeofencesValue';
import DriverValue from '../common/components/DriverValue';
import MotionBar from './components/MotionBar';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  cardWrapper: {
    padding: theme.spacing(1, 2), // Padding around the real card space to simulate gap in List
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    backgroundColor: 'rgba(2, 6, 23, 0.5)', // Slate 950 very dark
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(2, 6, 23, 0.8)',
      borderColor: 'rgba(16, 185, 129, 0.4)', // Emerald glowing hint
      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
      transform: 'translateY(-1px)',
    }
  },
  selectedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald tint base
    borderColor: '#10B981',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: '#10B981',
    }
  },
  avatar: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  avatarSelected: {
    backgroundColor: '#10B981',
    border: '1px solid #10B981',
  },
  icon: {
    width: '20px',
    height: '20px',
    filter: 'brightness(0) invert(1)',
  },
  success: {
    color: '#10B981', // URBUS Emerald
  },
  warning: {
    color: '#F97316',
  },
  error: {
    color: '#EF4444',
  },
  neutral: {
    color: '#94a3b8',
  },
  primaryText: {
    fontWeight: 700,
    color: '#f8fafc',
    fontSize: '0.95rem',
  },
  secondaryText: {
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2px', // Tighter spacing for modern look
  }
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const resolveFieldValue = (field) => {
    if (field === 'geofenceIds') {
      const geofenceIds = position?.geofenceIds;
      return geofenceIds?.length ? <GeofencesValue geofenceIds={geofenceIds} /> : null;
    }
    if (field === 'driverUniqueId') {
      const driverUniqueId = position?.attributes?.driverUniqueId;
      return driverUniqueId ? <DriverValue driverUniqueId={driverUniqueId} /> : null;
    }
    if (field === 'motion') {
      return <MotionBar deviceId={item.id} />;
    }
    return item[field];
  };

  const primaryValue = resolveFieldValue(devicePrimary);
  const secondaryValue = resolveFieldValue(deviceSecondary);

  const secondaryText = () => {
    let status;
    if (item.status === 'online' || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <span className={classes.secondaryText}>
        {secondaryValue && (
          <>
            {secondaryValue}
            {' • '}
          </>
        )}
        <span className={classes[getStatusColor(item.status)]}>{status}</span>
      </span>
    );
  };

  const isSelected = selectedDeviceId === item.id;

  return (
    <div style={style} className={classes.cardWrapper}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        className={cx(classes.card, isSelected && classes.selectedCard)}
        disableRipple
      >
        <ListItemAvatar>
          <Avatar className={isSelected ? classes.avatarSelected : classes.avatar}>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={primaryValue}
          secondary={secondaryText()}
          slots={{
            primary: Typography,
            secondary: Typography,
          }}
          slotProps={{
            primary: { noWrap: true, className: classes.primaryText },
            secondary: { noWrap: true, className: classes.secondaryText },
          }}
        />
        {position && (
          <div className={classes.actions}>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip
                title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}
              >
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={18} height={18} className={classes.success} />
                  ) : (
                    <EngineIcon width={18} height={18} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip
                title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}
              >
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 &&
                    (position.attributes.charge ? (
                      <BatteryChargingFullIcon fontSize="small" className={classes.success} />
                    ) : (
                      <BatteryFullIcon fontSize="small" className={classes.success} />
                    ))) ||
                    (position.attributes.batteryLevel > 30 &&
                      (position.attributes.charge ? (
                        <BatteryCharging60Icon fontSize="small" className={classes.warning} />
                      ) : (
                        <Battery60Icon fontSize="small" className={classes.warning} />
                      ))) ||
                    (position.attributes.charge ? (
                      <BatteryCharging20Icon fontSize="small" className={classes.error} />
                    ) : (
                      <Battery20Icon fontSize="small" className={classes.error} />
                    ))}
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
