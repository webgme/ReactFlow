import { useState, useCallback } from 'react';
import {Handle, Position, useConnection, useUpdateNodeInternals} from '@xyflow/react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

export default function classNode({id, data}) {
  const [isHovering, setIsHovering] = useState(false);
  const connection = useConnection();
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Set the hover state to true when the mouse enters the node
  const handleMouseEnter = useCallback(() => {
    updateNodeInternals(id);
    setIsHovering(true);
  }, [id,updateNodeInternals]);
  
  // Set the hover state to false when the mouse leaves the node
  const handleMouseLeave = useCallback(() => {
    updateNodeInternals(id);
    setIsHovering(false);
  }, [id,updateNodeInternals]);
  
  const handleConnect = useCallback((params) => {
    if (isHovering && connection.inProgress) {
      setIsHovering(false);
    }
  }, [isHovering, connection.inProgress]);

  // Check if this node can be a target (not the source and connection is active)
  const canBeTarget = connection.inProgress && connection.fromNode.id !== id;


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
        onMouseUp={handleConnect}
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
        {/* Source handles */}
        {Array.from({ length: data.numOfSources || 0 }, (_, i) => {
          const totalSources = data.numOfSources || 1;
          const topPosition = totalSources === 1 ? 50 : (100 / (totalSources + 1)) * (i + 1);
          return (
            <Handle 
              key={`s${i}`}
              id={`s${i}`} 
              position={Position.Right}
              style={{ top: `${topPosition}%` }}
              isConnectable={false}
              type='source'
            />
          );
        })}
        
        {/* Target handles */}
        {Array.from({ length: data.numOfTargets || 0 }, (_, i) => {
          const totalTargets = data.numOfTargets || 1;
          const topPosition = totalTargets === 1 ? 50 : (100 / (totalTargets + 1)) * (i + 1);
          return (
            <Handle 
              key={`t${i}`}
              id={`t${i}`} 
              position={Position.Left}
              style={{ top: `${topPosition}%` }}
              isConnectable={false}
              type='target'
            />
          );
        })}

        {/* Custom source handle - upper left corner, visible on hover but not when connecting */}
        <Handle 
          id="custom-source"
          position={Position.Top}
          style={{ 
            top: '12px',
            left: '5px',
            width: '16px',
            height: '16px',
            background: '#e3f2fd',
            border: '2px solid #fff',
            borderRadius: '50%',
            opacity: (isHovering && !connection.inProgress) ? 1 : 0,
            transition: 'opacity 0.2s ease',
            cursor: 'crosshair'
          }}
          isConnectable={true}
          type='source'
        />

        {/* Custom target handle - covers entire node, invisible but changes cursor */}
        {canBeTarget && (
          <Handle 
            id="custom-target"
            position={Position.Top}
            style={{ 
              width: '100%',
              height: '100%',
              background: 'blue',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 0,
              transform: 'none',
              border: 'none',
              opacity: 0
            }}
            isConnectable={true}
            type='target'
          />
        )}

      </div>
  )
}