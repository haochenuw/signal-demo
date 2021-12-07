// export interface Ratchet<T> {
//     rootKey: T
//     ephemeralKeyPair?: KeyPairType<T>
//     lastRemoteEphemeralKey: T
//     previousCounter: number
//     added?: number //timestamp
// }
import PubSub from 'pubsub-js'
import React, { useState, useEffect } from "react";
import Key from "./Key.js"
import {abToS, toAB} from "../util.tsx"
import FancyChain from "./FancyChain.js"
export default function Ratchet(props){
    const [currentShowingChain, setCurrentShowingChain] = useState(null);
    const [currentShowingEphemeralKey, setCurrentShowingEphemeralKey] = useState("");
    const [isChainShowing, setIsChainShowing] = useState(false);
    const [selectedRootKey, setSelectedRootKey] = useState(null); 
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

    function onRootKeyClick(rootKey) {
        const rootKeyString = abToS(rootKey); 
        console.log("rootKey clicked", rootKeyString)
        setSelectedRootKey(rootKey); 
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[rootKeyString]; 
        if (ephemeralKey !== undefined){
            setCurrentShowingEphemeralKey(ephemeralKey); 
        } else {
            setCurrentShowingEphemeralKey(""); 
        }
        const chain = props.chains[ephemeralKey]; 
        if (chain !== undefined){
            console.log('successly found chain!')
            setCurrentShowingChain(chain); 
            setIsChainShowing(true); 
        } else {
            console.log('no chain!')
            setCurrentShowingChain(null); 
        }
        PubSub.publish('discoverTopic', 'rootKey');
    }

    const chainInfoPanel = () => {
        if (isChainShowing && currentShowingChain !== null) {
            return (
                <FancyChain chain={currentShowingChain}/>
            )
        }
        else if (isChainShowing){
            return (<div>No chain associated with this root key!</div>)
        }
        return (<div>Click on a root key to show the chain</div>)
    }

    const ephemeralKeyPanel = () => {
        if (currentShowingEphemeralKey === ""){
            return null; 
        }
        return (<div> 
            <h2>Ephemeral Key</h2>
            <Key desc={"Public ephemeral key"} keyArray={toAB(currentShowingEphemeralKey)}/>
            </div>
        )
    }

    return (
        <>
            <h2>Ratchets</h2>
            {props.ratchet.rootKeyHistory.map((item, index) => { return (
                <Key selected={selectedRootKey === item} key={index} desc={"RootKey"} keyArray={item} onClick={() => onRootKeyClick(item)}></Key>
                )
            })}
            {ephemeralKeyPanel()}
            {chainInfoPanel()}
        </>
    )
}