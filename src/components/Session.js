// export interface SessionType<T = ArrayBuffer> {
//     indexInfo: IndexInfo<T>
//     registrationId: number
//     currentRatchet: Ratchet<T>
//     pendingPreKey?: PendingPreKey<T>

//     oldRatchetList: OldRatchetInfo<T>[]

//     chains: { [ephKeyString: string]: Chain<T> }
// }
import PubSub from 'pubsub-js'
import React from "react"
import Ratchet from "./Ratchet";
import {Title, SubTitle} from './Styled.js'
import Key from "./Key.js"

export default function Session(props){
    if (props.session === null){
        return <>NO SESSION EXISTS</>
    }

    return (
        <div className="sessionType">
            <SubTitle onClick={() => {PubSub.publish('discoverTopic', 'baseKey');}}>BaseKey</SubTitle>
            <Key desc="base key" onClick={() => {PubSub.publish('discoverTopic', 'baseKey');}} keyArray={props.session.indexInfo.baseKey}/>
            <Ratchet clientName={props.name} ratchet = {props.session.currentRatchet} chains={props.session.chains}/>
        </div>
    )
}