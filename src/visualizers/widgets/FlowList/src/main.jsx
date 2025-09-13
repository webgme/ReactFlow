import React, { useState, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MdAdd,
  MdDelete,
  MdExitToApp,
  MdAccountTree,
  MdDescription,
  MdSettings,
  MdCode,
  MdDashboard
} from 'react-icons/md';

// Sample data for demonstration - this would come from props in real implementation
const sampleElements = [
  {
    id: '1',
    name: 'User Management System',
    type: 'class-diagram',
    description: 'Main user management classes and relationships',
    icon: <MdAccountTree />,
    lastModified: '2024-01-15'
  },
  {
    id: '2',
    name: 'API Documentation',
    type: 'flowchart',
    description: 'API endpoint flow and data structures',
    icon: <MdDescription />,
    lastModified: '2024-01-14'
  },
  {
    id: '3',
    name: 'Database Schema',
    type: 'er-diagram',
    description: 'Database tables and relationships',
    icon: <MdSettings />,
    lastModified: '2024-01-13'
  },
  {
    id: '4',
    name: 'Authentication Flow',
    type: 'sequence-diagram',
    description: 'User authentication and authorization flow',
    icon: <MdCode />,
    lastModified: '2024-01-12'
  },
  {
    id: '5',
    name: 'System Architecture',
    type: 'architecture-diagram',
    description: 'High-level system components and interactions',
    icon: <MdDashboard />,
    lastModified: '2024-01-11'
  }
];

export default function ListComponent(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [elements, setElements] = useState(props.elements || sampleElements);

  const handleEnterElement = useCallback((elementId) => {
    console.log('Entering element:', elementId);
    // This would call props.global.enterElement(elementId) in real implementation
    if (props.global && props.global.enterElement) {
      props.global.enterElement(elementId);
    }
  }, [props.global]);

  const handleDeleteElement = useCallback((elementId) => {
    console.log('Deleting element:', elementId);
    // This would call props.global.deleteElement(elementId) in real implementation
    if (props.global && props.global.deleteElement) {
      props.global.deleteElement(elementId);
    }
    // Update local state for immediate UI feedback
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, [props.global]);

  const handleCreateElement = useCallback(() => {
    console.log('Creating new element');
    // This would call props.global.createElement() in real implementation
    if (props.global && props.global.createElement) {
      props.global.createElement();
    }
  }, [props.global]);

  const handleExit = useCallback(() => {
    console.log('Exiting list view');
    // This would call props.global.exit() in real implementation
    if (props.global && props.global.exit) {
      props.global.exitElement();
    }
  }, [props.global]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ flexGrow: 1, fontWeight: 'medium' }}
          >
            Diagrams
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleCreateElement}
            sx={{ mr: 1 }}
            title="Create New Diagram"
          >
            <MdAdd />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleExit}
            title="Exit"
          >
            <MdExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: 2,
        backgroundColor: theme.palette.grey[50]
      }}>
        <Paper 
          elevation={2} 
          sx={{ 
            maxWidth: 800, 
            mx: 'auto',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <List sx={{ p: 0 }}>
            {elements.map((element, index) => (
              <ListItem
                key={element.id}
                sx={{
                  backgroundColor: index % 2 === 0 
                    ? theme.palette.background.paper 
                    : theme.palette.grey[50],
                  borderBottom: index < elements.length - 1 
                    ? `1px solid ${theme.palette.divider}` 
                    : 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  transition: 'background-color 0.2s ease-in-out',
                  minHeight: 72,
                  px: 3,
                  py: 2
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 48,
                  color: theme.palette.primary.main,
                  fontSize: '1.5rem'
                }}>
                  {element.icon}
                </ListItemIcon>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ 
                      fontWeight: 'medium',
                      color: theme.palette.text.primary,
                      mb: 0.5
                    }}
                  >
                    {element.name}
                  </Typography>
                  <Box>
                    <Typography 
                      variant="body2" 
                      component="div"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {element.description}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      component="div"
                      color="text.disabled"
                    >
                      Type: {element.type}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  alignItems: 'center',
                  ml: 2
                }}>
                  <IconButton
                    onClick={() => handleEnterElement(element.id)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    title="Enter Diagram"
                  >
                    <MdAccountTree />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteElement(element.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.error.contrastText,
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    title="Delete Diagram"
                  >
                    <MdDelete />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

    </Box>
  );
}
