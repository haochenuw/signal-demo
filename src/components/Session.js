import React from "react"
import Chain from "./Chain"
import Ratchet from "./Ratchet";

import {
    Paper, Typography,
  } from "@material-ui/core";

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
            <Paper>
            <Ratchet clientName={props.name} ratchet = {props.session.currentRatchet}/>
            {/* {props.session.chains !== undefined && chains()} */}
            </Paper>
        </div>
    )
}