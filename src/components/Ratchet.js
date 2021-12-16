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
    const [hasChain, setHasChain] = useState(false);
    const [selectedRootKey, setSelectedRootKey] = useState(null); 

    const findChain = (ephemeralKey) => {
        var chain = undefined
        if (ephemeralKey !== undefined){
            if (ephemeralKey.sending === true){
                chain = props.chains[abToS(ephemeralKey.local?.pubKey)]; 
            } else {
                chain = props.chains[abToS(ephemeralKey.remote)]; 
            }
        } 
        return chain 
    }

    function onRootKeyClick(rootKey, index) {
        console.log('Rootkey clicked', index)
        setSelectedRootKey(index); 
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[abToS(props.ratchet.rootKeyHistory[selectedRootKey])];
        const chain = findChain(ephemeralKey)
        if (chain !== undefined){
            console.log("chain is found!")
            setHasChain(true); 
        } else {
            console.log('no chain!')
            setHasChain(false)
        }
        PubSub.publish('discoverTopic', 'rootKey');
    }

    const chainInfoPanel = () => {
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[abToS(props.ratchet.rootKeyHistory[selectedRootKey])];
        const chain = findChain(ephemeralKey)
        if (chain !== undefined) {
            return (
                <FancyChain chain={chain}/>
            )
        }
        else {
            return (<div>No chain associated with this Ratchet!</div>)
        }
    }

    const ephemeralKeyPanel = () => {
        const ephemeralKey = props.ratchet.rootKeyToEphemeralKeyMapping[abToS(props.ratchet.rootKeyHistory[selectedRootKey])];
        console.log("mapping = ", props.ratchet.rootKeyToEphemeralKeyMapping)
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
                <Key selected={selectedRootKey === index} key={index} desc={"RootKey"} keyArray={item} onClick={() => onRootKeyClick(item, index)}></Key>
                )
            })}
            {selectedRootKey !== null && ephemeralKeyPanel()}
            {selectedRootKey !== null && chainInfoPanel()}
        </>
    )
}