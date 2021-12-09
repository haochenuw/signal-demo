// export interface Chain<T> {
//     chainType: ChainType
//     chainKey: { key: T; counter: number }
//     messageKeys: { [key: number]: T }
//     chainKeyHistory: Array<T>; 
// }
import PubSub from 'pubsub-js'
import React, {useState} from "react"
import Key from "./Key.js"
import Button from '@material-ui/core/Button'
import {
    Grid,
} from "@material-ui/core";
import { H3Title } from './Styled.js';

export default function FancyChain(props) {
    const [showMessageKeys, setShowMessageKeys] = useState(false)
    const handleOnClick = () => {
        setShowMessageKeys(!showMessageKeys)
    }
    const chainTypeStr = props.chain.chainType === 1 ? "SENDING" : "RECEIVING"; 

    const handleChainTitleClick = () => {
        console.log('chain title clicked')
        PubSub.publish('discoverTopic', 'chain');
    }

    const handleMessageKeyClick = () => {
        PubSub.publish('discoverTopic', 'messageKey');
    }

    const handleChainKeyClick = () => {
        PubSub.publish('discoverTopic', 'chainKey');
    }

    return(
        <>
            <H3Title onClick={()=> handleChainTitleClick()}>{chainTypeStr} Chain</H3Title>
            <Button color='primary' onClick={() => {
                handleOnClick(); 
                console.log("clicked toggle message key, length = " + Object.keys(props.chain.messageKeys).length)
            }}>Show/Hide Message keys</Button>
            <Grid container spacing={2} justify="center">
                <Grid item xs={6}>
                {props.chain.chainKeyHistory.map((item, index) => (
                    <Key onClick={() => handleChainKeyClick()} key={index} desc={"chain key " + index} keyArray = {item}/>
                ))}
                </Grid>
                <Grid item>
                    {showMessageKeys && Object.keys(props.chain.messageKeys).map(id => (
                        <Key onClick={() => handleMessageKeyClick()} key={id} desc={"message key " + id} keyArray = {props.chain.messageKeys[id]}/>
                    ))}
                </Grid>
            </Grid>
        </>
    )
}
