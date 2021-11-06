import {
    SessionCipher,
    MessageType,
    SessionType
  } from "@privacyresearch/libsignal-protocol-typescript";

import base64 from 'base64-js'


export interface ChatMessage {
    id: number;
    to: string;
    from: string;
    message: MessageType;
    delivered: boolean;
}

export function doStuff(){
    console.log("doing stuff");
}

export async function getSessionsFrom(sessionCipher: SessionCipher): Promise<SessionType[]> {
    let sessionRecord = await sessionCipher.getRecordPublic(); 
    if (sessionRecord === undefined){
        return []
    }
    const sessions = sessionRecord.getSessions(); 
    return Object.values(sessions); 
}

export function tob64Str(input: ArrayBuffer): String {
    return Buffer.from(new Uint8Array(input)).toString('base64');
}

export function abToS(b: ArrayBuffer): string {
    return base64.fromByteArray(new Uint8Array(b))
}

export const readMessage = async (msg: ChatMessage, cipher: SessionCipher) => {
    let plaintext: ArrayBuffer = new Uint8Array().buffer;
    if (msg.message.type === 3) {
        console.log({ preKeyMessage: msg })
        plaintext = await cipher.decryptPreKeyWhisperMessage(
            msg.message.body!,
            "binary"
        );
    } else if (msg.message.type === 1) {
        console.log({ normalMessage: msg })
        plaintext = await cipher.decryptWhisperMessage(
            msg.message.body!,
            "binary"
        );
    }
    const stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));

    const { id, to, from } = msg;

    return { id, to, from, messageText: stringPlaintext };
};