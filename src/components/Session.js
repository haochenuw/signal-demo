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

    // console.log("Rendering Session", props.session) 
    
    if (props.session === null){
        return <>Session: NULL</>
    }

    return (
        <div className="sessionType">
            <Paper><h2>{props.name}'s session</h2></Paper>
            <Paper className="ratchet">
                <Ratchet ratchet = {props.session.currentRatchet}/>
            </Paper>
            {props.session.chains !== undefined && chains()}
        </div>
    )
}