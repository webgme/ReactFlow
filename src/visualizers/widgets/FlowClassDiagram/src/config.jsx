import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Switch
} from '@mui/material';

export default function Config({ onClose, onSave, config, initialValues = {} }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  

  // Initialize form data when config changes - simple approach
  useEffect(() => {
    if (config && config.elements) {
      const data = {};
      Object.keys(config.elements).forEach(key => {
        data[key] = initialValues[key] || config.elements[key].defaultValue || '';
      });
      setFormData(data);
    }
  }, [config]); // Only depend on config, not initialValues

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(config.elements).forEach(fieldName => {
      const element = config.elements[fieldName];
      const value = formData[fieldName];

      // Required field validation
      if (element.required && (!value || value.toString().trim() === '')) {
        newErrors[fieldName] = `${element.displayName} is required`;
      }

      // String length validation
      if (element.type === 'string' && element.maxLength && value && value.length > element.maxLength) {
        newErrors[fieldName] = `${element.displayName} must be ${element.maxLength} characters or less`;
      }

      // Number validation
      if (element.type === 'number' && value && isNaN(Number(value))) {
        newErrors[fieldName] = `${element.displayName} must be a valid number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  const renderFormElement = (fieldName, element) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    

    switch (element.type) {
      case 'string':
        // Try without variant to match the working one
        return (
          <TextField
            key={fieldName}
            fullWidth
            label={element.displayName}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || element.helpText}
            multiline={element.multiline}
            rows={element.rows || 1}
            maxLength={element.maxLength}
            required={element.required}
            placeholder={element.placeholder}
          />
        );

      case 'number':
        return (
          <TextField
            key={fieldName}
            fullWidth
            label={element.displayName}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || element.helpText}
            required={element.required}
            inputProps={{
              min: element.min,
              max: element.max,
              step: element.step
            }}
          />
        );

      case 'enum':
        return (
          <FormControl key={fieldName} fullWidth error={!!error} required={element.required}>
            <InputLabel>{element.displayName}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
            >
              {element.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
            {element.helpText && !error && (
              <Typography variant="caption" color="textSecondary">{element.helpText}</Typography>
            )}
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              />
            }
            label={element.displayName}
          />
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              />
            }
            label={element.displayName}
          />
        );

      default:
        return (
          <TextField
            key={fieldName}
            fullWidth
            label={element.displayName}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            error={!!error}
            helperText={error || element.helpText}
            required={element.required}
          />
        );
    }
  };


  if (!config) {
    return null;
  }

  return (
    <Dialog open={true} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{config.title || 'Configuration'}</DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.keys(config.elements).map((fieldName) => (
            <Box key={fieldName}>
              {renderFormElement(fieldName, config.elements[fieldName])}
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
