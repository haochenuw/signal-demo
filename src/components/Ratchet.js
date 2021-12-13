// export interface Ratchet<T> {
//     rootKey: T
//     ephemeralKeyPair?: KeyPairType<T>
//     lastRemoteEphemeralKey: T
//     previousCounter: number
//     added?: number //timestamp
// }
import React, { useState } from "react";
import Key from "./Key.js"
import {abToS, toAB} from "../util.tsx"
import FancyChain from "./FancyChain.js"
import {H3Title, SubTitle} from './Styled.js'
import PubSub from 'pubsub-js'

export default function Ratchet(props){
    const [currentShowingChain, setCurrentShowingChain] = useState(null);
    const [isChainShowing, setIsChainShowing] = useState(false);
    const [selectedRootKey, setSelectedRootKey] = useState(null); 

    function onRootKeyClick(rootKey) {
        setSelectedRootKey(rootKey); 
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[abToS(rootKey)]; 
        var chain = undefined; 
        if (ephemeralKey !== undefined){
            chain = props.chains[abToS(ephemeralKey.local?.pubKey)]; 
            if (chain === undefined){
                // try another 
                chain = props.chains[abToS(ephemeralKey.remote)]; 
            }
        } 
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
        return (<div>Click on a root key to show its chain</div>)
    }

    const ephemeralKeyPanel = () => {
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[abToS(selectedRootKey)];
        console.log("mapping = ", JSON.stringify(props.ratchet.rootKeyToEphemeralKeyMapping))
        console.log("ephemeralKey = ", JSON.stringify(ephemeralKey))
        let remoteEphemeralKey = null; 
        let localEphemeralKeypair = null; 
        if (ephemeralKey !== undefined){
            remoteEphemeralKey = ephemeralKey["remote"]; 
            localEphemeralKeypair = ephemeralKey["local"]; 
        } 
        return (<div> 
            <H3Title>Remote Ephemeral Key</H3Title>
            <Key desc={"remote ephemeral public key"} keyArray={remoteEphemeralKey}/>
            <H3Title>Local Ephemeral Keypair</H3Title>
            <Key desc={"local ephemeral public key"} keyArray={localEphemeralKeypair?.pubKey ?? null}/>
            <Key desc={"local ephemeral private key"} keyArray={localEphemeralKeypair?.privKey ?? null}/>
            </div>
        )
    }

    return (
        <>
            <SubTitle onClick={()=>{PubSub.publish("discoverTopic", "ratchet")}}>Ratchets</SubTitle>
            {props.ratchet.rootKeyHistory.map((item, index) => { return (
                <Key selected={selectedRootKey === item} key={index} desc={"RootKey"} keyArray={item} onClick={() => onRootKeyClick(item)}></Key>
                )
            })}
            {selectedRootKey !== null && ephemeralKeyPanel()}
            {selectedRootKey !== null && chainInfoPanel()}
        </>
    )
}