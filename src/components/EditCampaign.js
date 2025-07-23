import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  IconButton,
  CircularProgress,
  Box,
  Typography,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';

import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { useStateContext } from '../contexts/ContextProvider';

const EditCampaign = ({ open, campaign, onClose, onUpdate }) => {
  const { adminData, userData } = useStateContext();
  const adminId = adminData?.adminId || userData?.adminId;
  
  const [formData, setFormData] = useState({
    campaignName: '',
    title: '',
    description: '',
    fundraisingGoal: '',
    currentProgress: '',
    serviceCode: '',
    endDate: '',
    isActive: false,
    imagesURL: []
  });
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaignName: campaign.campaignName || campaign.title || '',
        title: campaign.title || campaign.campaignName || '',
        description: campaign.description || '',
        fundraisingGoal: campaign.fundraisingGoal || 0,
        currentProgress: campaign.currentProgress || 0,
        serviceCode: campaign.serviceCode || '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        isActive: campaign.isActive || false,
        imagesURL: campaign.imagesURL || []
      });
    }
  }, [campaign]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageLoading(true);
    const uploadPromises = [];

    for (const file of files) {
      const storageRef = ref(storage, `campaigns/${adminId}/${Date.now()}_${file.name}`);
      uploadPromises.push(
        uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref))
      );
    }

    try {
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        imagesURL: [...prev.imagesURL, ...urls]
      }));
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagesURL: prev.imagesURL.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!campaign?.id) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        fundraisingGoal: Number(formData.fundraisingGoal),
        currentProgress: Number(formData.currentProgress),
        updatedAt: new Date().toISOString(),
        adminId: adminId
      };

      // Use middleware API to update campaign
      await apiService.updateCampaign(campaign.id, updateData);
      console.log('✅ Campaign updated via middleware:', campaign.id);
      toast.success('Campaign updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    const now = new Date();
    const endDate = formData.endDate ? new Date(formData.endDate) : null;
    
    if (!formData.isActive) return { label: "Inactive", color: "default" };
    if (endDate && endDate < now) return { label: "Ended", color: "error" };
    if (formData.isActive) return { label: "Active", color: "success" };
    return { label: "Draft", color: "warning" };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Edit Campaign</Typography>
            <Chip {...getStatus()} size="small" />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Campaign Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Campaign Name"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          {/* Service Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Service Code"
              name="serviceCode"
              value={formData.serviceCode}
              onChange={handleChange}
              variant="outlined"
              required
              helperText="This cannot be changed after creation"
              disabled
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              required
            />
          </Grid>

          {/* Fundraising Goal */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fundraising Goal (GHS)"
              name="fundraisingGoal"
              type="number"
              value={formData.fundraisingGoal}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          {/* Current Progress */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Current Progress (GHS)"
              name="currentProgress"
              type="number"
              value={formData.currentProgress}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="Campaign is Active"
            />
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Campaign Images
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              {formData.imagesURL.map((url, index) => (
                <Box
                  key={index}
                  position="relative"
                  width={120}
                  height={120}
                  borderRadius={1}
                  overflow="hidden"
                  border="1px solid #e0e0e0"
                >
                  <img
                    src={url}
                    alt={`Campaign ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Box
                width={120}
                height={120}
                borderRadius={1}
                border="2px dashed #ccc"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: '#f5f5f5'
                  }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
                {imageLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <CameraAltIcon color="action" />
                    <Typography variant="caption" color="textSecondary">
                      Add Images
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading || !formData.campaignName || !formData.description}
          sx={{
            backgroundColor: '#7c3aed',
            '&:hover': {
              backgroundColor: '#6b21a8'
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCampaign; 