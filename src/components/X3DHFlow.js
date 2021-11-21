import ReactFlow from 'react-flow-renderer';
import { FlowChartWithState } from "@mrblenny/react-flow-chart";

import React, { useState, useEffect } from "react";
import 'beautiful-react-diagrams/styles.css';
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams';

const chartSimple = {
    offset: {
      x: 0,
      y: 0
    },
    nodes: {
      node1: {
        id: "node1",
        type: "output-only",
        position: {
          x: 300,
          y: 100
        },
        ports: {
          port1: {
            id: "port1",
            type: "output",
            properties: {
              value: "yes"
            }
          },
          port2: {
            id: "port2",
            type: "output",
            properties: {
              value: "no"
            }
          }
        }
      },
      node2: {
        id: "node2",
        type: "input-output",
        position: {
          x: 300,
          y: 300
        },
        ports: {
          port1: {
            id: "port1",
            type: "input"
          },
          port2: {
            id: "port2",
            type: "output"
          }
        }
      },
      node3: {
        id: "node3",
        type: "input-output",
        position: {
          x: 100,
          y: 600
        },
        ports: {
          port1: {
            id: "port1",
            type: "input"
          },
          port2: {
            id: "port2",
            type: "output"
          }
        }
      },
      node4: {
        id: "node4",
        type: "input-output",
        position: {
          x: 500,
          y: 600
        },
        ports: {
          port1: {
            id: "port1",
            type: "input"
          },
          port2: {
            id: "port2",
            type: "output"
          }
        }
      }
    },
    links: {
      link1: {
        id: "link1",
        from: {
          nodeId: "node1",
          portId: "port2"
        },
        to: {
          nodeId: "node2",
          portId: "port1"
        },
        properties: {
          label: "example link label"
        }
      },
      link2: {
        id: "link2",
        from: {
          nodeId: "node2",
          portId: "port2"
        },
        to: {
          nodeId: "node3",
          portId: "port1"
        },
        properties: {
          label: "another example link label"
        }
      },
      link3: {
        id: "link3",
        from: {
          nodeId: "node2",
          portId: "port2"
        },
        to: {
          nodeId: "node4",
          portId: "port1"
        }
      }
    },
    selected: {},
    hovered: {}
};

// the diagram model
const initialSchema = createSchema({
    nodes: [
      { id: 'node-1', content: 'Node 1', coordinates: [250, 60], },
      { id: 'node-2', content: 'Node 2', coordinates: [100, 200], },
      { id: 'node-3', content: 'Node 3', coordinates: [250, 220], },
      { id: 'node-4', content: 'Node 4', coordinates: [400, 200], },
    ],
    links: [
      { input: 'node-1',  output: 'node-2' },
      { input: 'node-1',  output: 'node-3' },
      { input: 'node-1',  output: 'node-4' },
    ]
  });
  
export default function X3DHFlow(props){    
    const UncontrolledDiagram = () => {
        // create diagrams schema
        const [schema, { onChange }] = useSchema(initialSchema);
      
        return (
          <div style={{ height: '22.5rem' }}>
            <Diagram schema={schema} onChange={onChange} />
          </div>
        );
    };
    return(
        <UncontrolledDiagram />
    )
}