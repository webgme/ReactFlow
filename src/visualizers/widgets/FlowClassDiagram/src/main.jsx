import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, Position, addEdge, BaseEdge, getSmoothStepPath, EdgeLabelRenderer, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import classNode from './class';
import Config from './config';
import ContextMenu from './contextMenu';
import Fab from '@mui/material/Fab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { 
  MdAdd, 
  MdDelete, 
  MdSettings, 
  MdFunctions,
  MdRemove 
} from 'react-icons/md';

// Config objects defined outside component to prevent re-creation
const ADD_ATTRIBUTE_CONFIG = {
  title: 'Add Attribute',
  elements: {
    visibility: {
      displayName: 'Visibility',
      type: 'enum',
      options: ['public', 'private', 'protected', 'package'],
      defaultValue: 'public'
    },
    name: {
      displayName: 'Name',
      type: 'string',
      required: true,
      defaultValue: ' '
    },
    type: {
      displayName: 'Type',
      type: 'string',
      required: true,
      defaultValue: ' '
    }
  }
};

const ADD_METHOD_CONFIG = {
  title: 'Add Method',
  elements: {
    visibility: {
      displayName: 'Visibility',
      type: 'enum',
      options: ['public', 'private', 'protected', 'package'],
      defaultValue: 'public'
    },
    specification: {
      displayName: 'Specification',
      type: 'string',
      required: true,
      defaultValue: '',
      // placeholder: 'functionName(args)',
      helpText: 'Enter method specification in format: functionName(args)'
    }
  }
};

const getNodeConfig = (nodeLabel) => ({
  title: `Configure ${nodeLabel || 'Node'}`,
  elements: {
    name: {
      displayName: 'Class Name',
      type: 'string',
      required: true,
      defaultValue: nodeLabel || ''
    },
    visibility: {
      displayName: 'Visibility',
      type: 'enum',
      options: ['public', 'private', 'protected'],
      defaultValue: 'public'
    },
    isAbstract: {
      displayName: 'Abstract',
      type: 'boolean',
      defaultValue: false
    }
  }
});


const getEdgeConfig = (edgeData, sourceNode, targetNode) => {
  const relationshipType = edgeData?.type || 'association';
  
  
  // Configurable relationship types
  const configurableTypes = ['composition', 'aggregation', 'association', 'navigableAssociation'];
  
  if (!configurableTypes.includes(relationshipType)) {
    return {
      title: 'Configure Relationship',
      elements: {
        info: {
          displayName: 'Information',
          type: 'string',
          defaultValue: `Configuration not available for ${relationshipType} relationships`,
          disabled: true
        }
      }
    };
  }

  return {
    title: 'Configure Relationship',
    elements: {
      sourceRole: {
        displayName: sourceNode?.data?.label ? `${sourceNode.data.label} Role` : 'Source Role',
        type: 'string',
        defaultValue: edgeData?.data?.sourceRole || ' ',
        placeholder: sourceNode?.data?.label ? `Role for ${sourceNode.data.label}` : 'Source role'
      },
      sourceCardinality: {
        displayName: sourceNode?.data?.label ? `${sourceNode.data.label} Cardinality` : 'Source Cardinality',
        type: 'string',
        defaultValue: edgeData?.data?.sourceCardinality || ' ',
        placeholder: 'e.g., 1, *, 0..1'
      },
      destinationRole: {
        displayName: targetNode?.data?.label ? `${targetNode.data.label} Role` : 'Destination Role',
        type: 'string',
        defaultValue: edgeData?.data?.destinationRole || ' ',
        placeholder: targetNode?.data?.label ? `Role for ${targetNode.data.label}` : 'Destination role'
      },
      destinationCardinality: {
        displayName: targetNode?.data?.label ? `${targetNode.data.label} Cardinality` : 'Destination Cardinality',
        type: 'string',
        defaultValue: edgeData?.data?.destinationCardinality || ' ',
        placeholder: 'e.g., 1, *, 0..1'
      }
    }
  };
};

const InheritanceEdge = ({ id, sourceX, sourceY, targetX, targetY, path, style }) => {
  //console.log('InheritanceEdge rendering:', { id, sourceX, sourceY, targetX, targetY, path, style });
  
  // Use getSmoothStepPath to create a smooth path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#uml-generalization)"
        style={{ stroke: 'black', strokeWidth: 2, ...style }}
      />
    </>
  );
};

const CompositionEdge = ({ id, sourceX, sourceY, targetX, targetY, path, style, data }) => {
  //console.log('CompositionEdge rendering:', { id, sourceX, sourceY, targetX, targetY, path, style });
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#uml-composition)"
        style={{ stroke: 'black', strokeWidth: 2, ...style }}
      />
      <EndLabels sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} startLabel={data?.startLabel} endLabel={data?.endLabel} path={edgePath} />
    </>
  );
};

const AggregationEdge = ({ id, sourceX, sourceY, targetX, targetY, path, style, data }) => {
  //console.log('AggregationEdge rendering:', { id, sourceX, sourceY, targetX, targetY, path, style });
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#uml-aggregation)"
        style={{ stroke: 'black', strokeWidth: 2, ...style }}
      />
      <EndLabels sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} startLabel={data?.startLabel} endLabel={data?.endLabel} path={edgePath} />
    </>
  );
};

const NavigableAssociationEdge = ({ id, sourceX, sourceY, targetX, targetY, path, style, data }) => {
  //console.log('NavigableAssociationEdge rendering:', { id, sourceX, sourceY, targetX, targetY, path, style });
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#uml-navigable-association)"
        style={{ stroke: 'black', strokeWidth: 2, ...style }}
      />
      <EndLabels sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} startLabel={data?.startLabel} endLabel={data?.endLabel} path={edgePath} />
    </>
  );
};

const EndLabels = ({ sourceX, sourceY, targetX, targetY, startLabel, endLabel, path}) => {
  //console.log('EndLabels props:', { sourceX, sourceY, targetX, targetY, startLabel, endLabel, path });

  // Function to get point on path at a given percentage
  const getPointOnPath = (pathString, percentage) => {
    if (!pathString) {
      // Fallback to straight line calculation
      return {
        x: sourceX + (targetX - sourceX) * percentage,
        y: sourceY + (targetY - sourceY) * percentage
      };
    }

    // Create a temporary path element to get point at length
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', pathString);
    
    const totalLength = pathElement.getTotalLength();
    const point = pathElement.getPointAtLength(totalLength * percentage);
    
    return { x: point.x, y: point.y };
  };

  // Get positions along the actual path
  const startPoint = getPointOnPath(path, 0.1); // 10% along the path
  const endPoint = getPointOnPath(path, 0.9);   // 90% along the path

  return (
    <EdgeLabelRenderer>
            {/* Start Label */}
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${startPoint.x}px,${startPoint.y}px)`,
                background: 'white',
                border: '1px solid #ccc',
                padding: '1px 3px',
                borderRadius: 2,
                fontSize: 5,
                fontWeight: 'normal',
                color: 'black',
                pointerEvents: 'none',
                zIndex: 10,
              }}
              className="nodrag nopan"
            >
              {startLabel || 'Start'}
            </div>

            {/* End Label */}
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${endPoint.x}px,${endPoint.y}px)`,
                background: 'white',
                border: '1px solid #ccc',
                padding: '1px 3px',
                borderRadius: 2,
                fontSize: 5,
                fontWeight: 'normal',
                color: 'black',
                pointerEvents: 'none',
                zIndex: 10,
              }}
              className="nodrag nopan"
            >
              {endLabel || 'End'}
            </div>
          </EdgeLabelRenderer>
  );
};

const AssociationEdge = ({ id, sourceX, sourceY, targetX, targetY, path, style, data }) => {
  //console.log('AssociationEdge rendering:', { id, sourceX, sourceY, targetX, targetY, path, style });
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: 'black', strokeWidth: 2, ...style }}
      />
      <EndLabels sourceX={sourceX} sourceY={sourceY} targetX={targetX} targetY={targetY} startLabel={data?.startLabel} endLabel={data?.endLabel} path={edgePath} />
    </>
  );
};

const nodeTypes = {
  class: classNode,
};

const edgeTypes = {
  inheritance: InheritanceEdge,
  composition: CompositionEdge,
  aggregation: AggregationEdge,
  navigableAssociation: NavigableAssociationEdge,
  association: AssociationEdge,
};

export default function Flow(props) {
  const [nodes, setNodes] = useState(props.nodes);
  const [edges, setEdges] = useState(props.edges);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configType, setConfigType] = useState('node'); // 'node', 'addAttribute', 'addMethod'
  const [currentConfig, setCurrentConfig] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    anchorPosition: { top: 0, left: 0 },
    contextData: null
  });
  const [classNameDialog, setClassNameDialog] = useState({
    open: false,
    className: ''
  });
  const [linkTypeDialog, setLinkTypeDialog] = useState({
    open: false,
    sourceId: null,
    targetId: null
  });

  // Available link types
  const linkTypes = [
    { id: 'Association', label: 'Association' },
    { id: 'NavigableAssociation', label: 'Navigable Association' },
    { id: 'Composition', label: 'Composition' },
    { id: 'Aggregation', label: 'Aggregation' },
    { id: 'Inheritance', label: 'Inheritance' },
    { id: 'Realization', label: 'Realization' },
    { id: 'Dependency', label: 'Dependency' }
  ];

  // Define menu items for nodes (function that takes node data)
  const getNodeMenuItems = (nodeData) => [
    {
      id: 'add-attribute',
      label: 'Add Attribute',
      icon: <MdAdd />,
      action: 'addAttribute'
    },
    {
      id: 'delete-attribute',
      label: 'Delete Attribute',
      icon: <MdDelete />,
      action: 'deleteAttribute',
      disabled: !nodeData?.attributes || nodeData.attributes.length === 0,
      submenuItems: nodeData?.attributes?.map(attr => ({
        name: typeof attr === 'object' ? attr.name : attr,
        id: typeof attr === 'object' ? attr.id : null,
        action: 'deleteAttribute'
      })) || []
    },
    {
      id: 'separator-1',
      type: 'separator'
    },
    {
      id: 'add-method',
      label: 'Add Method',
      icon: <MdFunctions />,
      action: 'addMethod'
    },
    {
      id: 'remove-method',
      label: 'Remove Method',
      icon: <MdRemove />,
      action: 'removeMethod',
      disabled: !nodeData?.methods || nodeData.methods.length === 0,
      submenuItems: nodeData?.methods?.map(method => {
        let methodName;
        let methodId = null;
        if (typeof method === 'object') {
          methodName = method.name || '';
          methodId = method.id || null;
        } else {
          methodName = method || '';
        }
        // Extract name up to first '(' character
        const parenIndex = methodName.indexOf('(');
        const displayName = parenIndex !== -1 ? methodName.substring(0, parenIndex) : methodName;
        
        return {
          name: displayName,
          id: methodId,
          action: 'removeMethod'
        };
      }) || []
    },
    {
      id: 'separator-2',
      type: 'separator'
    },
    {
      id: 'config',
      label: 'Config',
      icon: <MdSettings />,
      action: 'config'
    },
    {
      id: 'delete-class',
      label: 'Delete Class',
      icon: <MdDelete />,
      action: 'deleteClass'
    }
  ];

  // Define menu items for edges (function to make it dynamic)
  const getEdgeMenuItems = (edgeData) => {
    const relationshipType = edgeData?.type || 'association';
    const configurableTypes = ['composition', 'aggregation', 'association', 'navigableAssociation'];
    
    
    return [
      {
        id: 'config-edge',
        label: 'Config',
        icon: <MdSettings />,
        action: 'configEdge',
        disabled: !configurableTypes.includes(relationshipType)
      },
      {
        id: 'delete-relationship',
        label: 'Delete Relationship',
        icon: <MdDelete />,
        action: 'deleteRelationship'
      }
    ];
  };

  // Sync local state with props when props change
  useEffect(() => {
    setNodes(props.nodes);
    setEdges(props.edges);
  }, [props.nodes, props.edges]);

  const handleAddButtonClick = () => {
    setClassNameDialog({
      open: true,
      className: ''
    });
  };

  const handleNodeClick = useCallback((event, node) => {
    setContextMenu({
      open: true,
      anchorPosition: { top: event.clientY, left: event.clientX },
      contextData: node
    });
  }, []);

  const handleEdgeClick = useCallback((event, edge) => {
    setContextMenu({
      open: true,
      anchorPosition: { top: event.clientY, left: event.clientX },
      contextData: edge
    });
  }, []);


  const handleConfigSave = useCallback((formData) => {
    if (configType === 'addAttribute') {
      // Handle adding attribute to the node
      props.global.addAttribute(selectedNode.id, formData.name, formData.visibility, formData.type);
    } else if (configType === 'addMethod') {
      // Handle adding method to the node
      props.global.addMethod(selectedNode.id, formData.visibility, formData.specification);
    } else if (configType === 'edge') {
      // Handle edge configuration - map form data to edge data structure
      const edgeData = {
        sourceRole: formData.sourceRole,
        sourceCardinality: formData.sourceCardinality,
        destinationRole: formData.destinationRole,
        destinationCardinality: formData.destinationCardinality
      };
      props.global.updateEdge(selectedNode.id, edgeData);
    }
    
    setConfigOpen(false);
    setSelectedNode(null);
  }, [selectedNode, configType]);

  const handleConfigClose = useCallback(() => {
    setConfigOpen(false);
    setSelectedNode(null);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({
      open: false,
      anchorPosition: { top: 0, left: 0 },
      contextData: null
    });
  }, []);

  const handleContextMenuItemClick = useCallback((action, contextData, itemData) => {
    
    switch (action) {
      // Node actions
      case 'addAttribute':
        // Handle add attribute - open config dialog
        setSelectedNode(contextData);
        setConfigType('addAttribute');
        setCurrentConfig(ADD_ATTRIBUTE_CONFIG);
        setConfigOpen(true);
        break;
      case 'deleteAttribute':
        // Handle delete attribute
        props.global.deleteAttribute(contextData.id, itemData.id, itemData.itemName);
        break;
      case 'addMethod':
        // Handle add method - open config dialog
        setSelectedNode(contextData);
        setConfigType('addMethod');
        setCurrentConfig(ADD_METHOD_CONFIG);
        setConfigOpen(true);
        break;
      case 'removeMethod':
        // Handle remove method
        props.global.deleteMethod(contextData.id, itemData.id);
        break;
      case 'config':
        // Open config dialog for node
        setSelectedNode(contextData);
        setConfigType('node');
        setCurrentConfig(getNodeConfig(contextData?.data?.label));
        setConfigOpen(true);
        break;
      case 'deleteClass':
        // Handle delete class
        // console.log('Deleting class:', contextData.id);
        props.global.deleteClass(contextData.id);
        break;
      // Edge actions
      case 'configEdge':
        // Open config dialog for edge
        setSelectedNode(contextData);
        setConfigType('edge');
        
        // Find source and target nodes for the edge
        const sourceNode = nodes.find(node => node.id === contextData.source);
        const targetNode = nodes.find(node => node.id === contextData.target);
        
        setCurrentConfig(getEdgeConfig(contextData, sourceNode, targetNode));
        setConfigOpen(true);
        break;
      case 'deleteRelationship':
        // Handle delete relationship
        props.global.deleteAssociation(contextData.id);
        break;
      default:
        break;
    }
  }, []);

  const handleClassNameChange = (event) => {
    setClassNameDialog(prev => ({
      ...prev,
      className: event.target.value
    }));
  };

  const handleCreateClass = () => {
    if (classNameDialog.className.trim()) {
      // Call the global addClass function with the class name
      props.global.addClass(classNameDialog.className);
      setClassNameDialog({
        open: false,
        className: ''
      });
    }
  };

  const handleCancelCreateClass = () => {
    setClassNameDialog({
      open: false,
      className: ''
    });
  };

  const handleLinkTypeSelect = (linkType) => {
    // Call the global createAssociation function
    props.global.createAssociation(linkTypeDialog.sourceId, linkTypeDialog.targetId, linkType);
    
    // Close the dialog
    setLinkTypeDialog({
      open: false,
      sourceId: null,
      targetId: null
    });
  };

  const handleCancelLinkType = () => {
    setLinkTypeDialog({
      open: false,
      sourceId: null,
      targetId: null
    });
  };

  const handleNodeDragStop = useCallback((event, node) => {
    //console.log('Node drag stopped:', node.id, 'at position:', node.position);
    
    // Update our global state with the final position
    props.global.setPosition(node.id, node.position);
  }, [props.global]);
 
  const onNodesChange = useCallback((changes) => {
    // Update local state for smooth animation
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    // Update local state for smooth animation
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    // Show link type dialog instead of directly creating connection
    setLinkTypeDialog({
      open: true,
      sourceId: params.source,
      targetId: params.target
    });

  }, []);
 
  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <marker id="uml-composition"
                viewBox="0 0 6 3"
                refX="5.4" refY="1.5"
                markerWidth="6" markerHeight="3"
                orient="auto">
              <polygon points="3 0, 0 1.5, 3 3, 6 1.5" fill="black" stroke="black" strokeWidth="1"/>
            </marker>
            <marker id="uml-aggregation"
                viewBox="0 0 6 3"
                refX="5.4" refY="1.5"
                markerWidth="6" markerHeight="3"
                orient="auto">
              <polygon points="3 0, 0 1.5, 3 3, 6 1.5" fill="white" stroke="black" strokeWidth="1"/>
            </marker>
            <marker id="uml-navigable-association"
                viewBox="0 0 8 6"
                refX="7" refY="3"
                markerWidth="8" markerHeight="6"
                orient="auto">
              <path d="M 0 0 L 8 3 L 0 6" fill="none" stroke="black" strokeWidth="1"/>
            </marker>
            <marker id="uml-generalization"
              markerWidth="6" markerHeight="5"
              refX="5" refY="2.5"
              orient="auto-start-reverse">
              <polygon points="0,0 6,2.5 0,5" stroke="black" fill="white" strokeWidth="1" strokeLinejoin="miter"/>
            </marker>
          </defs>
        </svg>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <style>
          {`
            .react-flow__attribution {
              display: none !important;
            }
          `}
        </style>
        <ReactFlow
          elementsSelectable={false}
          elementsFocusable={false}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onNodeDragStop={handleNodeDragStop}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
        </ReactFlow>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddButtonClick}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <FaPlus />
        </Fab>
      </div>
      
      {/* Config Dialog */}
      {configOpen && (
        <Config
          onClose={handleConfigClose}
          onSave={handleConfigSave}
          config={currentConfig}
        />
      )}

      {/* Context Menu */}
      <ContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.anchorPosition}
        onClose={handleContextMenuClose}
        onMenuItemClick={handleContextMenuItemClick}
        menuItems={contextMenu.contextData?.source && contextMenu.contextData?.target ? getEdgeMenuItems(contextMenu.contextData) : getNodeMenuItems(contextMenu.contextData?.data)}
        contextData={contextMenu.contextData}
      />

      {/* Class Name Dialog */}
      <Dialog open={classNameDialog.open} onClose={handleCancelCreateClass} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            variant="outlined"
            value={classNameDialog.className}
            onChange={handleClassNameChange}
            placeholder="Enter class name..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateClass();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreateClass}>Cancel</Button>
          <Button 
            onClick={handleCreateClass} 
            variant="contained"
            disabled={!classNameDialog.className.trim()}
          >
            Create Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Type Dialog */}
      <Dialog open={linkTypeDialog.open} onClose={handleCancelLinkType} maxWidth="sm" fullWidth>
        <DialogTitle>Select Relationship Type</DialogTitle>
        <DialogContent>
          <List>
            {linkTypes.map((linkType) => (
              <ListItem key={linkType.id} disablePadding>
                <ListItemButton onClick={() => handleLinkTypeSelect(linkType.id)}>
                  <ListItemText primary={linkType.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLinkType}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}