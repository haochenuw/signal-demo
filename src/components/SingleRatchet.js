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
import {abToS} from "../util.tsx"
import FancyChain from "./FancyChain.js"

export default function Ratchet(props){


}