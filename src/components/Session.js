// export interface SessionType<T = ArrayBuffer> {
//     indexInfo: IndexInfo<T>
//     registrationId: number
//     currentRatchet: Ratchet<T>
//     pendingPreKey?: PendingPreKey<T>

//     oldRatchetList: OldRatchetInfo<T>[]

//     chains: { [ephKeyString: string]: Chain<T> }
// }

import React from "react"
import Chain from "./Chain"
import Ratchet from "./Ratchet";
import {Title, SubTitle} from './Styled.js'


export default function Session(props){
    if (props.session === null){
        return <>NO SESSION EXISTS</>
    }

    return (
        <div className="sessionType">
            <SubTitle>BaseKey</SubTitle>
            <Ratchet clientName={props.name} ratchet = {props.session.currentRatchet} chains={props.session.chains}/>
        </div>
    )
}