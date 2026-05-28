import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MuiFileInput } from 'mui-file-input';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const DevicePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [searchParams] = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);
  const [showQr, setShowQr] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Route and checkpoint state
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [existingDeviceRoute, setExistingDeviceRoute] = useState(null);
  const [routeCheckpoints, setRouteCheckpoints] = useState([]);
  const [allCheckpoints, setAllCheckpoints] = useState([]);
  const [openCheckpointDialog, setOpenCheckpointDialog] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState('');
  const [savingRoute, setSavingRoute] = useState(false);

  // Load current route assignment when editing device
  useEffect(() => {
    if (item?.id) {
      fetch(`/api/device-routes?deviceId=${item.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((assignments) => {
          if (assignments?.length > 0) {
            const latest = assignments[assignments.length - 1];
            setExistingDeviceRoute(latest);
            setSelectedRouteId(latest.routeId);
          } else {
            setExistingDeviceRoute(null);
            setSelectedRouteId(null);
          }
        })
        .catch(() => {
          setExistingDeviceRoute(null);
          setSelectedRouteId(null);
        });
    }
  }, [item?.id]);

  // Load route checkpoints
  useEffect(() => {
    if (selectedRouteId) {
      fetch(`/api/route-checkpoints?routeId=${selectedRouteId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setRouteCheckpoints(Array.isArray(data) ? data : []))
        .catch(() => setRouteCheckpoints([]));

      fetch('/api/checkpoints')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setAllCheckpoints(Array.isArray(data) ? data : []))
        .catch(() => setAllCheckpoints([]));
    }
  }, [selectedRouteId]);

  const handleFileInput = useCatch(async (newFile) => {
    setImageFile(newFile);
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: newFile,
      });
      setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
    } else if (!newFile) {
      const { deviceImage, ...remainingAttributes } = item.attributes || {};
      setItem({ ...item, attributes: remainingAttributes });
    }
  });

  const handleRouteChange = useCallback(async (newRouteId) => {
    try {
      setSavingRoute(true);

      if (existingDeviceRoute?.id) {
        await fetch(`/api/device-routes/${existingDeviceRoute.id}`, {
          method: 'DELETE',
        });
      }

      if (newRouteId) {
        const response = await fetch('/api/device-routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: parseInt(item.id),
            routeId: parseInt(newRouteId),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setExistingDeviceRoute(data);
          setSelectedRouteId(parseInt(newRouteId));
          setRouteCheckpoints([]);
        }
      } else {
        setExistingDeviceRoute(null);
        setSelectedRouteId(null);
        setRouteCheckpoints([]);
      }
    } catch (error) {
      console.error('Error changing route:', error);
    } finally {
      setSavingRoute(false);
    }
  }, [item?.id, existingDeviceRoute?.id]);

  const handleDeleteRoute = useCallback(async () => {
    try {
      setSavingRoute(true);
      if (existingDeviceRoute?.id) {
        await fetch(`/api/device-routes/${existingDeviceRoute.id}`, {
          method: 'DELETE',
        });
        setExistingDeviceRoute(null);
        setSelectedRouteId(null);
        setRouteCheckpoints([]);
      }
    } catch (error) {
      console.error('Error deleting route:', error);
    } finally {
      setSavingRoute(false);
    }
  }, [existingDeviceRoute?.id]);

  const handleEditRoute = useCallback(() => {
    if (selectedRouteId) {
      navigate(`/settings/route/${selectedRouteId}`);
    }
  }, [selectedRouteId, navigate]);

  const handleAddCheckpoint = useCallback(async () => {
    if (!selectedCheckpointId) return;
    try {
      setSavingRoute(true);
      const response = await fetch('/api/route-checkpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: parseInt(selectedRouteId),
          checkpointId: parseInt(selectedCheckpointId),
        }),
      });

      if (response.ok) {
        setOpenCheckpointDialog(false);
        setSelectedCheckpointId('');
        // Reload checkpoints
        const res = await fetch(`/api/route-checkpoints?routeId=${selectedRouteId}`);
        if (res.ok) {
          setRouteCheckpoints(await res.json());
        }
      }
    } catch (error) {
      console.error('Error adding checkpoint:', error);
    } finally {
      setSavingRoute(false);
    }
  }, [selectedRouteId, selectedCheckpointId]);

  const handleRemoveCheckpoint = useCallback(async (checkpointId) => {
    try {
      setSavingRoute(true);
      const cpToDelete = routeCheckpoints.find((cp) => cp.checkpointId === checkpointId);
      if (cpToDelete?.id) {
        await fetch(`/api/route-checkpoints/${cpToDelete.id}`, {
          method: 'DELETE',
        });
        setRouteCheckpoints(routeCheckpoints.filter((cp) => cp.checkpointId !== checkpointId));
      }
    } catch (error) {
      console.error('Error removing checkpoint:', error);
    } finally {
      setSavingRoute(false);
    }
  }, [routeCheckpoints]);

  const availableCheckpoints = allCheckpoints.filter(
    (cp) => !routeCheckpoints.find((rc) => rc.checkpointId === cp.id),
  );

  const validate = () => item && item.name && item.uniqueId;

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
      onItemSaved={(savedItem) => handleSaveRoute(savedItem.id)}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                helperText={t('deviceIdentifierHelp')}
                disabled={Boolean(uniqueId)}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
              <TextField
                value={item.phone || ''}
                onChange={(event) => setItem({ ...item, phone: event.target.value })}
                label={t('sharedPhone')}
              />
              <TextField
                value={item.model || ''}
                onChange={(event) => setItem({ ...item, model: event.target.value })}
                label={t('deviceModel')}
              />
              <TextField
                value={item.contact || ''}
                onChange={(event) => setItem({ ...item, contact: event.target.value })}
                label={t('deviceContact')}
              />
              <SelectField
                value={item.category || 'default'}
                onChange={(event) => setItem({ ...item, category: event.target.value })}
                data={deviceCategories
                  .map((category) => ({
                    id: category,
                    name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                  }))
                  .sort((a, b) => a.name.localeCompare(b.name))}
                label={t('deviceCategory')}
              />
              <SelectField
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
              <TextField
                label={t('userExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!admin}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.disabled}
                    onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                  />
                }
                label={t('sharedDisabled')}
                disabled={!admin}
              />
              <Button variant="outlined" color="primary" onClick={() => setShowQr(true)}>
                {t('sharedQrCode')}
              </Button>
            </AccordionDetails>
          </Accordion>
          {/* Route Assignment Accordion */}
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('sharedRoute')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <SelectField
                    value={selectedRouteId || ''}
                    emptyValue=""
                    emptyTitle={t('sharedSelectRoute')}
                    onChange={(event) => handleRouteChange(event.target.value || null)}
                    endpoint="/api/routes"
                    label={t('sharedRoute')}
                    disabled={savingRoute}
                  />

                  {selectedRouteId && (
                    <Stack spacing={2}>
                      {/* Edit and Delete buttons */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={handleEditRoute}
                          disabled={savingRoute}
                        >
                          {t('sharedEdit')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDeleteRoute}
                          disabled={savingRoute}
                        >
                          {t('sharedRemove')}
                        </Button>
                      </Stack>

                      {/* Checkpoints Table */}
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{t('sharedCheckpoints')}</Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCheckpointDialog(true)}
                            disabled={savingRoute || availableCheckpoints.length === 0}
                          >
                            {t('sharedAdd')}
                          </Button>
                        </Stack>

                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell align="center">#</TableCell>
                                <TableCell>{t('sharedName')}</TableCell>
                                <TableCell align="right">{t('positionLatitude')}</TableCell>
                                <TableCell align="right">{t('positionLongitude')}</TableCell>
                                <TableCell align="center">{t('sharedAction')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {routeCheckpoints.length > 0 ? (
                                routeCheckpoints.map((rc, index) => {
                                  const checkpoint = allCheckpoints.find((cp) => cp.id === rc.checkpointId);
                                  return (
                                    <TableRow key={rc.id}>
                                      <TableCell align="center">{index + 1}</TableCell>
                                      <TableCell>{checkpoint?.name || `Checkpoint ${rc.checkpointId}`}</TableCell>
                                      <TableCell align="right">{checkpoint?.latitude?.toFixed(4) || '-'}</TableCell>
                                      <TableCell align="right">{checkpoint?.longitude?.toFixed(4) || '-'}</TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemoveCheckpoint(rc.checkpointId)}
                                          disabled={savingRoute}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} align="center">
                                    {t('sharedNoData')}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Add Checkpoint Dialog */}
          <Dialog open={openCheckpointDialog} onClose={() => setOpenCheckpointDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{t('sharedSelectCheckpoint')}</DialogTitle>
            <DialogContent sx={{ minHeight: '120px' }}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('sharedCheckpoint')}</InputLabel>
                <Select
                  label={t('sharedCheckpoint')}
                  value={selectedCheckpointId}
                  onChange={(e) => setSelectedCheckpointId(e.target.value)}
                >
                  {availableCheckpoints.map((cp) => (
                    <MenuItem key={cp.id} value={cp.id}>
                      {cp.name} ({cp.latitude?.toFixed(4)}, {cp.longitude?.toFixed(4)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCheckpointDialog(false)}>{t('sharedCancel')}</Button>
              <Button
                onClick={handleAddCheckpoint}
                variant="contained"
                disabled={!selectedCheckpointId || savingRoute}
              >
                {t('sharedAdd')}
              </Button>
            </DialogActions>
          </Dialog>
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('attributeDeviceImage')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <MuiFileInput
                  placeholder={t('attributeDeviceImage')}
                  value={imageFile}
                  onChange={handleFileInput}
                  inputProps={{ accept: 'image/*' }}
                />
              </AccordionDetails>
            </Accordion>
          )}
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
