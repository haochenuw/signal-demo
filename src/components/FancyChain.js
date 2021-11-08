// export interface Chain<T> {
//     chainType: ChainType
//     chainKey: { key: T; counter: number }
//     messageKeys: { [key: number]: T }
// }

import React, {useState} from "react"
import Key from "./Key.js"

export default function FancyChain(props) {
    const [showMessageKeys, setShowMessageKeys] = useState(false)
    const handleOnClick = () => {
        setShowMessageKeys(!showMessageKeys)
    }
    return(
        <>
            <Key desc={"chain key"} keyArray = {props.chain.chainKey.key} onclick={() => handleOnClick()}/>
            {showMessageKeys && Object.keys(props.chain.messageKeys).map(id => (
                <Key key={id} desc={"message key"} keyArray = {props.chain.messageKeys[id]}/>
            ))}
        </>
    )
}
