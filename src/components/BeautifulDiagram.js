import React, { useState, useEffect } from "react";
import 'beautiful-react-diagrams/styles.css';
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams';

export default function BeautifulDiagram(props){    
    const UncontrolledDiagram = () => {
        // create diagrams schema
        const initialSchema = createSchema(props.graphDef); 
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