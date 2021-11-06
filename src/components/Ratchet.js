// export interface Ratchet<T> {
//     rootKey: T
//     ephemeralKeyPair?: KeyPairType<T>
//     lastRemoteEphemeralKey: T
//     previousCounter: number
//     added?: number //timestamp
// }
import {
    List,
} from "@material-ui/core";

import ListItem from '@material-ui/core/ListItem';
import ReactFlow from 'react-flow-renderer';

import React, { useState, useEffect } from "react";
import Key from "./Key.js"
import {abToS} from "../util.tsx"

import {
    Paper,
  } from "@material-ui/core";

import Chain from "./Chain.js"

export default function Ratchet(props){
    const [currentShowingChain, setCurrentShowingChain] = useState(null);
    const [isChainShowing, setIsChainShowing] = useState(false);

    // console.log("props = ", props)

    var rootKeyFlowElements = props.ratchet.rootKeyHistory.map((item, index) => {
        return {
                    id: index.toString() + props.clientName, 
                    data: {label: <Key desc={index} keyArray={item}></Key>, rootkey: item}, 
                    position: {x: 0, y: 100 + index*40}, 
                    style: {
                        width: 200 
                    }
                }
    }); 
    
    const onElementClick = (event, element) => {
        console.log('click', element.data.rootkey);
        if (props.ratchet.chainHistory[abToS(element.data.rootkey)] !== undefined){
            console.log('successly found chain!')
            const chain = props.ratchet.chainHistory[abToS(element.data.rootkey)]; 
            setCurrentShowingChain(chain); 
            setIsChainShowing(true); 
        } else {
            console.log('no chain!')
        }
    }


    return (
        <Paper>
            Ratchet Info: 
            <List component="div" disablePadding>
            <ListItem>
                <Key desc="current" keyArray={props.ratchet.rootKey}></Key>
            </ListItem>
            {props.ratchet.rootKeyHistory.map((item, index) => { return (
                <ListItem>
                    <Key desc={index} keyArray={item}></Key>
                </ListItem>
                )
            })}
            </List>
            {/* <p>
                Previous counter {props.ratchet.previousCounter}
            </p>
            <p>
                Last Remote Ephemeral Key: {tob64Str(props.ratchet.lastRemoteEphemeralKey)}
            </p> */}
            <div style={{ height: 300 }}>
                <ReactFlow 
                onElementClick={onElementClick}
                elements={rootKeyFlowElements} />
            </div>
            {isChainShowing && <Chain chain={currentShowingChain}/>}
        </Paper>
    )
}