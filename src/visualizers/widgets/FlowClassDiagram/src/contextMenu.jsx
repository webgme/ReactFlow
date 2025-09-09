import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';

export default function ContextMenu({ 
  open, 
  anchorPosition, 
  onClose, 
  onMenuItemClick,
  menuItems = [],
  contextData = null 
}) {
  const [submenuAnchor, setSubmenuAnchor] = useState(null);
  const [submenuItems, setSubmenuItems] = useState([]);

  const handleMenuItemClick = (action, itemData) => {
    onMenuItemClick(action, contextData, itemData);
    onClose();
  };

  const handleSubmenuOpen = (event, items) => {
    setSubmenuAnchor(event.currentTarget);
    setSubmenuItems(items);
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchor(null);
    setSubmenuItems([]);
  };

  const handleSubmenuItemClick = (action, itemName, itemData) => {
    onMenuItemClick(action, contextData, { ...itemData, itemName });
    handleSubmenuClose();
    onClose();
  };

  return (
    <>
      <Menu
        open={open}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        {menuItems.map((item) => {
          if (item.type === 'separator') {
            return <Divider key={item.id || `separator-${Math.random()}`} />;
          }

          // Check if this item has submenu items
          const hasSubmenu = item.submenuItems && item.submenuItems.length > 0;

          return (
            <MenuItem
              key={item.id}
              onClick={hasSubmenu ? undefined : () => handleMenuItemClick(item.action, item)}
              onMouseEnter={hasSubmenu ? (e) => handleSubmenuOpen(e, item.submenuItems) : undefined}
              disabled={item.disabled}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                ...(item.sx || {})
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  ...(item.labelProps || {})
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
      
      {/* Submenu */}
      <Menu
        open={Boolean(submenuAnchor)}
        anchorEl={submenuAnchor}
        onClose={handleSubmenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            minWidth: 150,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        {submenuItems.map((subItem, index) => (
          <MenuItem
            key={index}
            onClick={() => handleSubmenuItemClick(subItem.action, subItem.name, subItem)}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText 
              primary={subItem.name}
              primaryTypographyProps={{
                variant: 'body2',
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
