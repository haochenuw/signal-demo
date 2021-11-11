// export interface Chain<T> {
//     chainType: ChainType
//     chainKey: { key: T; counter: number }
//     messageKeys: { [key: number]: T }
//     chainKeyHistory: Array<T>; 
// }

import React, {useState} from "react"
import Key from "./Key.js"
import Button from '@material-ui/core/Button'
import {
    Grid,
} from "@material-ui/core";
export default function FancyChain(props) {
    const [showMessageKeys, setShowMessageKeys] = useState(false)
    const handleOnClick = () => {
        setShowMessageKeys(!showMessageKeys)
    }
    const chainTypeStr = props.chain.chainType === 1 ? "SENDING" : "RECEIVING"; 
    return(
        <>
            <h2>Chain Type: {chainTypeStr}</h2>
            <Button color='primary' onClick={() => {
                handleOnClick(); 
                console.log("clicked toggle message key, length = " + Object.keys(props.chain.messageKeys).length)
            }}>Toggle message keys</Button>
            <Grid container spacing={2} justify="center">
                <Grid item xs={6}>
                {props.chain.chainKeyHistory.map((item, index) => (
                    <Key key={index} desc={"chain key " + index} keyArray = {item}/>
                ))}
                </Grid>
                <Grid item>
                    {showMessageKeys && Object.keys(props.chain.messageKeys).map(id => (
                        <Key key={id} desc={"message key " + id} keyArray = {props.chain.messageKeys[id]}/>
                    ))}
                </Grid>
            </Grid>
        </>
    )
}
