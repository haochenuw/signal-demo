// export interface Chain<T> {
//     chainType: ChainType
//     chainKey: { key: T; counter: number }
//     messageKeys: { [key: number]: T }
//     chainKeyHistory: Array<T>; 
// }

import React, {useState} from "react"
import Key from "./Key.js"
import Button from '@material-ui/core/Button'

export default function FancyChain(props) {
    const [showMessageKeys, setShowMessageKeys] = useState(false)
    const handleOnClick = () => {
        setShowMessageKeys(!showMessageKeys)
    }
    const chainTypeStr = props.chain.chainType === 1 ? "SENDING" : "RECEIVING"; 
    return(
        <>
            <h2>Chain Type: {chainTypeStr}</h2>
            <Button onClick={() => {
                handleOnClick(); 
                console.log("clicked toggle message key, length = " + Object.keys(props.chain.messageKeys).length)
            }}>Toggle message keys</Button>
            {props.chain.chainKeyHistory.map((item, index) => (
                <Key key={index} desc={"chain key " + index} keyArray = {item}/>
            ))}
            {showMessageKeys && Object.keys(props.chain.messageKeys).map(id => (
                <Key key={id} desc={"message key " + id} keyArray = {props.chain.messageKeys[id]}/>
            ))}
        </>
    )
}
