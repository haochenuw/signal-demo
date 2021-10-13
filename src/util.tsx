import {
    KeyHelper,
    SignedPublicPreKeyType,
    SignalProtocolAddress,
    SessionBuilder,
    PreKeyType,
    SessionCipher,
    MessageType,
    SessionType
  } from "@privacyresearch/libsignal-protocol-typescript";

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