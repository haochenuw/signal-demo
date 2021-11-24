import ReactFlow from 'react-flow-renderer';
import { FlowChartWithState } from "@mrblenny/react-flow-chart";

import React, { useState, useEffect } from "react";
import 'beautiful-react-diagrams/styles.css';
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams';

// the diagram model
const initialSchema = createSchema({
    nodes: [
      { id: 'ratchet-1', content: 'Ratchet_1', coordinates: [250, 0], },
      { id: 'ratchet-2', content: 'Ratchet_2', coordinates: [250, 100], },
      { id: 'ratchet-3', content: 'Ratchet_3', coordinates: [250, 200], },
      { id: 'ratchet-4', content: 'Ratchet_4', coordinates: [250, 300], },
      { id: 'chain-1', content: 'Chain_1', coordinates: [400, 20], },
      { id: 'chain-2', content: 'Chain_2', coordinates: [400, 120], },
      { id: 'chain-3', content: 'Chain_3', coordinates: [400, 220], },
    ],
    links: [
      { input: 'ratchet-1',  output: 'ratchet-2' },
      { input: 'ratchet-2',  output: 'ratchet-3' },
      { input: 'ratchet-3',  output: 'ratchet-4' },
      { input: 'ratchet-1',  output: 'chain-1' },
      { input: 'ratchet-2',  output: 'chain-2' },
      { input: 'ratchet-3',  output: 'chain-3' },
    ]
  });
  
export default function SessionDiagram(props){    
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