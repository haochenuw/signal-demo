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
import Chain from "./Chain.js"

import {
    Paper,
  } from "@material-ui/core";
import { isConstructorDeclaration } from "typescript";

export default function Ratchet(props){
    const [currentShowingChain, setCurrentShowingChain] = useState(null);
    const [isChainShowing, setIsChainShowing] = useState(false);

    console.log('ratchet renders with ', props.ratchet); 

    var rootKeyFlowElements = props.ratchet.rootKeyHistory.map((item, index) => {
        return {
                    id: "root" + props.clientName + abToS(item), 
                    data: {label: <Key key={item} desc={index} keyArray={item}></Key>, rootkey: item}, 
                    position: {x: 0, y: 100 + index*40}, 
                    style: {
                        width: 200,
                        height: 60
                    }
                }
        }
    ); 

    // var chainFlowElements = Object.entries(props.ratchet.chainHistory).map(([rootKey, v], index) => {
    //     return {
    //         id: abToS(rootKey) + props.clientName, 
    //         data: {label: <Key key={v.chainKey.key} desc={""} keyArray={v.chainKey.key} />}, 
    //         position: {x: 200, y: 100 + index*40}, 
    //         style: {
    //             width: 200,
    //             height: 100,
    //         }
    //     }
    // }); 

    var chainFlowElements =[]; 

    var edges = []; 
    for (var i = 0 ; i < rootKeyFlowElements.length - 1; i++){
        edges.push(
        {
            id: 'edges-' + i.toString() + "-" + (i+1).toString(),
            source:  rootKeyFlowElements[i].id, 
            target: rootKeyFlowElements[i+1].id, 
            type: 'custom',
            arrowHeadType: 'arrowclosed',
        })
    }

    var totalElements = rootKeyFlowElements.concat(chainFlowElements).concat(edges); 
    
    const onElementClick = (event, element) => {
        // console.log('click', element.data.rootkey);
        console.log('click', props.clientName); 
        // if (props.ratchet.chainHistory[abToS(element.data.rootkey)] !== undefined){
        //     console.log('successly found chain!')
        //     const chain = props.ratchet.chainHistory[abToS(element.data.rootkey)]; 
        //     setCurrentShowingChain(chain); 
        //     setIsChainShowing(true); 
        // } else {
        //     console.log('no chain!')
        // }
    }

    function onRootKeyClick(rootKey) {
        const rootKeyString = abToS(rootKey); 
        console.log("rootKey clicked", rootKeyString)

        if (props.ratchet.chainHistory[rootKeyString] !== undefined){
            console.log('successly found chain!')
            const chain = props.ratchet.chainHistory[rootKeyString]; 
            setCurrentShowingChain(chain); 
            setIsChainShowing(true); 
        } else {
            console.log('no chain!')
            setCurrentShowingChain(null); 
        }
    }

    const showChain = () => {
        if (isChainShowing && currentShowingChain !== null) {
            return (
                <Chain chain={currentShowingChain}/>
            )
        }
        else if (isChainShowing){
            return (<div>No chain associated with this root key!</div>)
        }
        return (<div>Click on a root key to show the chain</div>)
    }


    return (
        <Paper>
            {props.ratchet.rootKeyHistory.map((item, index) => { return (
                <Key key={index} desc={index} keyArray={item} onClick={() => onRootKeyClick(item)}></Key>
                )
            })}
            <Key desc="current" keyArray={props.ratchet.rootKey} onClick={() => onRootKeyClick(props.ratchet.rootKey)}></Key>

            {/* <p>
                Previous counter {props.ratchet.previousCounter}
            </p>
            <p>
                Last Remote Ephemeral Key: {tob64Str(props.ratchet.lastRemoteEphemeralKey)}
            </p> */}
            {/* <div style={{ height: 500 }}>
                <ReactFlow 
                onElementClick={onElementClick}
                elements={totalElements}
                key={props.clientName} />
            </div> */}
            {showChain()}

        </Paper>
    )
}