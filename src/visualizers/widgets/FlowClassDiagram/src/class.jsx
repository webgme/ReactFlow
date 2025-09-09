import { useContext, useState } from 'react';
import {Handle, Position, NodeToolbar, useStore, useUpdateNodeInternals} from 'reactflow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

export default function classNode({id, data}) {
  const [isHovering, setIsHovering] = useState(false);
  // Set the hover state to true when the mouse enters the node
  const handleMouseEnter = () => setIsHovering(true);
  // Set the hover state to false when the mouse leaves the node
  const handleMouseLeave = () => setIsHovering(false);

  // Function to format attribute according to UML standard
  const formatAttribute = (attribute) => {
    if (typeof attribute === 'string') {
      return attribute; // Fallback for string attributes
    }
    
    if (attribute && typeof attribute === 'object') {
      const visibilityMap = {
        'public': '+',
        'private': '-',
        'protected': '#',
        'package': '~'
      };
      
      const visibility = visibilityMap[attribute.visibility] || '+';
      const name = attribute.name || '';
      const type = attribute.type || '';
      
      return `${visibility} ${name} : ${type}`;
    }
    
    return '';
  };

  // Function to format method according to UML standard
  const formatMethod = (method) => {
    if (typeof method === 'string') {
      return method; // Fallback for string methods
    }
    
    if (method && typeof method === 'object') {
      const visibilityMap = {
        'public': '+',
        'private': '-',
        'protected': '#',
        'package': '~'
      };
      
      const visibility = visibilityMap[method.visibility] || '+';
      const name = method.name || '';
      
      return `${visibility} ${name}`;
    }
    
    return '';
  };


  return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid black', borderRadius: '6px', paddingY: 0.25 }}>
          <List sx={{paddingY: 0}}>
            {data.stereotype && data.stereotype.trim().length > 0 && (
              <ListItem sx={{paddingY: 0, backgroundColor: 'lightgray'}}>
                <ListItemText 
                  primary={`<<${data.stereotype.trim()}>>`} 
                  sx={{ textAlign: 'center', fontStyle: 'italic', paddingY: 0, fontSize: '0.8em' }}
                />
              </ListItem>
            )}
            <ListItem sx={{paddingY: 0, backgroundColor: 'lightgray'}}>
              <ListItemText primary={data.label} sx={{ textAlign: 'center', fontWeight: 'bold', paddingY: 0 }}/>
            </ListItem>
            <Divider sx={{paddingY: 0.25, borderColor: 'black', backgroundColor: 'lightgray'}}/>
            {data.attributes.map((attribute, index) => (
              <ListItem key={index} sx={{paddingY: 0, textAlign: 'left', backgroundColor: 'white'}}>
                <ListItemText secondary={formatAttribute(attribute)} sx={{paddingY: 0}}/>
              </ListItem>
            ))}
            <Divider sx={{paddingY: 0.25, borderColor: 'black', backgroundColor: 'lightgray'}}/>
            {data.methods.map((method, index) => (
              <ListItem key={index} sx={{paddingY: 0, backgroundColor: 'white'}}>
                <ListItemText secondary={formatMethod(method)} sx={{paddingY: 0}}/>
              </ListItem>
            ))}
          </List>
        </Box>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />

      </div>
  )
}