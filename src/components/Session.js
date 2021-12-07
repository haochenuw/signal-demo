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


export default function Session(props){
    const chains = () => {
        return (
            <div className="chains">
                    {
                        Object.keys(props.session.chains).map((key, index) => ( 
                            <Chain key={index} chain={props.session.chains[key]} />
                        ))
                    }
            </div>
        )
    }

    if (props.session === null){
        return <>NO SESSION EXISTS</>
    }

    return (
        <div className="sessionType">
            <h2>BaseKey</h2>
            <Ratchet clientName={props.name} ratchet = {props.session.currentRatchet} chains={props.session.chains}/>
        </div>
    )
}