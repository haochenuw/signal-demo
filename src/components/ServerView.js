// export interface FullDirectoryEntry {
//     registrationId: number
//     identityPubKey: ArrayBuffer
//     signedPreKey: SignedPublicPreKeyType
//     oneTimePreKeys: PreKeyType[]
// }
// export interface PreKeyType<T = ArrayBuffer> {
//     keyId: number
//     publicKey: T
// }

// export interface SignedPublicPreKeyType<T = ArrayBuffer> extends PreKeyType<T> {
//     signature: T
// }
import Key from "./Key.js"
import React from "react"
import PubSub from 'pubsub-js'

import {
    Paper,
  } from "@material-ui/core";

export default function ServerView(props) {
    return(
        <Paper>
            <h2>ServerView</h2>
            {props.alicePreKeyBundle !== null && <PreKeyBundle 
                client={"Alice"}
                data = {props.alicePreKeyBundle}/>}
            {props.bobPreKeyBundle !== null && <PreKeyBundle 
                client={"Bob"}
                data = {props.bobPreKeyBundle}/>}
        </Paper>
    )
}

function PreKeyBundle(props) {
    return (
        <>
        <h2 onClick={() => PubSub.publish('discoverTopic', 'preKeyBundle')}>{props.client}'s Prekey Bundle</h2>
        <Key desc={"identity public key"} keyArray = {props.data.identityPubKey}/>
        <Key desc={"signed prekey"} keyArray = {props.data.signedPreKey.publicKey}/>
        </>
    )
}