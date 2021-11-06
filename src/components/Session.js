import React from "react"
import Chain from "./Chain"
import Ratchet from "./Ratchet";

import {
    Paper,
  } from "@material-ui/core";

export default function Session(props){
    const chains = () => {
        return (
            <div className="chains">
                    {
                        Object.keys(props.session.chains).map((key, index) => ( 
                            <Chain chain={props.session.chains[key]} />
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
            <Paper><h2>{props.name}'s session</h2></Paper>
            <Paper className="ratchet">
                <Ratchet clientName={props.name} ratchet = {props.session.currentRatchet}/>
            </Paper>
            {props.session.chains !== undefined && chains()}
        </div>
    )
}