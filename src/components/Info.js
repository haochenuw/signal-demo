
import React from "react";
import { Typography, Card } from '@mui/material';
import { styled } from '@mui/system';

import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    Controls,
  } from 'react-flow-renderer';

const MyDiv = styled('Typography')({
    color: '#ff4400',
    backgroundColor: 'aliceblue',
    padding: 8,
    borderRadius: 4,
    display: 'block', 
    textAlign: 'left', 
    fontSize: 34, 
  });


export default function Info(props){
    const { graphNode, descriptions, title, ...other } = props;
    return(
        <section>
        <div height="100%" flex="1">
        <Typography variant="h2" align="left">{title}</Typography>
        {props.descriptions.map((item) => (
            <MyDiv>{item}</MyDiv>
        ))}
        {graphNode !== undefined && 
        <ReactFlowProvider>
            {graphNode}
        </ReactFlowProvider>
        }
        {graphNode === undefined && <div>No Graph</div>}
        </div>
        </section>
    )
}