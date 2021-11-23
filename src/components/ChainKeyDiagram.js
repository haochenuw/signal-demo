import ReactFlow from 'react-flow-renderer';
import { FlowChartWithState } from "@mrblenny/react-flow-chart";

import React, { useState, useEffect } from "react";
import 'beautiful-react-diagrams/styles.css';
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams';

// the diagram model
const initialSchema = createSchema({
    nodes: [
      { id: 'node-1', content: 'Old Chain Key', coordinates: [250, 60], },
      { id: 'node-2', content: 'KDF', coordinates: [250, 200], },
      { id: 'node-3', content: 'Message Key', coordinates: [350, 200], },
      { id: 'node-4', content: 'New Chain Key', coordinates: [250, 320], },
    ],
    links: [
      { input: 'node-1',  output: 'node-2' },
      { input: 'node-2',  output: 'node-3' },
      { input: 'node-2',  output: 'node-4' },
    ]
  });
  
export default function ChainKeyDiagram(props){    
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