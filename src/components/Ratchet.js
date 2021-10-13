// export interface Ratchet<T> {
//     rootKey: T
//     ephemeralKeyPair?: KeyPairType<T>
//     lastRemoteEphemeralKey: T
//     previousCounter: number
//     added?: number //timestamp
// }

import React from "react"
import { tob64Str } from "../util";

import {
    Paper,
  } from "@material-ui/core";

export default function Ratchet(props){
    return (
        <Paper>
            Ratchet Info: 
            <p> 
                Root Key: {tob64Str(props.ratchet.rootKey)}
            </p>
            <p>
                Previous counter {props.ratchet.previousCounter}
            </p>
            <p>
                Last Remote Ephemeral Key: {tob64Str(props.ratchet.lastRemoteEphemeralKey)}
            </p>
        </Paper>
    )
}