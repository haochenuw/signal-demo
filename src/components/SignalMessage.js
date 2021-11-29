// interface ChatMessage {
//     id: number;
//     to: string;
//     from: string;
//     message: MessageType;
//     delivered: boolean;
// }

// export interface MessageType {
//     type: number;
//     body?: string;
//     registrationId: number;
// }

import React, {useState} from "react"
import Key from "./Key.js"
import { Typography, Button } from "@material-ui/core"
import PubSub from 'pubsub-js'
import {Collapse} from 'react-collapse';

import {
    PreKeyWhisperMessage, 
    WhisperMessage
}
from '@privacyresearch/libsignal-protocol-protobuf-ts'

const SignalMessageType = {
    NormalMessage: 1, 
    PreKeyMessage: 3, 
}

const decodeUtil = (buff) => {
    const view = new Uint8Array(buff)
    const version = view[0]
    const messageData = view.slice(1)

    return PreKeyWhisperMessage.decode(messageData);
}

const decodeNormalMessageUtil = (messageBytes) => {
    const messageProto = messageBytes.slice(1, messageBytes.byteLength - 8)
    const mac = messageBytes.slice(messageBytes.byteLength - 8, messageBytes.byteLength)

    const message = WhisperMessage.decode(new Uint8Array(messageProto))
    console.log('message', JSON.stringify(message))
    return message; 
}

function binaryStringToArrayBuffer(str) {
    let i = 0
    const k = str.length
    let charCode
    const bb = []
    while (i < k) {
        charCode = str.charCodeAt(i)
        if (charCode > 0xff) throw RangeError('illegal char code: ' + charCode)
        bb[i++] = charCode
    }
    return Uint8Array.from(bb).buffer
}

export default function SignalMessage(props){
    const [isContentOpen, setIsContentOpen] = useState(false); 

    const messageType = props.m.message.type; 

    const handlePendingMessageClick = (type) => {
        if (type === SignalMessageType.PreKeyMessage) {
            PubSub.publish('discoverTopic', 'preKeyMessage');
        } else {
            PubSub.publish('discoverTopic', 'whisperMessage');
        }
    }

    const buffer =  binaryStringToArrayBuffer(props.m.message.body); 

    const content = () => {
        if (messageType === SignalMessageType.PreKeyMessage){
            const proto = decodeUtil(buffer);
            return (<Key desc="Base Key" keyArray={proto.baseKey}></Key>
            )
        }
        else {
            const msg = decodeNormalMessageUtil(buffer); 
            return (<Key desc="Remote ephemeral Key" keyArray={msg.ephemeralKey}></Key>)
        }
    }
    return (
        <div>
            <Typography 
                onClick={()=>handlePendingMessageClick(messageType)} 
                variant="h4">
                MESSAGE {props.m.id}: {props.m.from} TO {props.m.to} Type:{messageType} 
            </Typography>
            <Button onClick={() => setIsContentOpen(!isContentOpen)}>Show</Button>
            <Collapse isOpened={isContentOpen}>
            {content()}
            </Collapse>
        </div>
    )
}