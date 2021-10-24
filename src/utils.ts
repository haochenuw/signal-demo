
import { SignalProtocolStore } from "./storage-type";
import {
    KeyHelper,
    SignedPublicPreKeyType,
    SignalProtocolAddress,
    SessionBuilder,
    PreKeyType,
    SessionCipher,
    MessageType,
    SessionType,
  } from "@privacyresearch/libsignal-protocol-typescript";
import { SignalDirectory } from "./signal-directory";


const storeSomewhereSafe = (store: SignalProtocolStore) => (
    key: string,
    value: any
  ) => {
    store.put(key, value);
  };


export const createID = async (name: string, store: SignalProtocolStore) => {
    const registrationId = KeyHelper.generateRegistrationId();
    // Store registrationId somewhere durable and safe... Or do this.
    storeSomewhereSafe(store)(`registrationID`, registrationId);

    const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
    // Store identityKeyPair somewhere durable and safe... Or do this.
    storeSomewhereSafe(store)("identityKey", identityKeyPair);

    var priv = Buffer.from(new Uint8Array(identityKeyPair.privKey)).toString('base64');
    var pub = Buffer.from(new Uint8Array(identityKeyPair.pubKey)).toString('base64');

    console.log(name, `identity keypair ceated`); 


    const preKeyId = Math.floor(10000 * Math.random());
    const preKey = await KeyHelper.generatePreKey(preKeyId);
    store.storePreKey(`${preKeyId}`, preKey.keyPair);

    const signedPreKeyId = Math.floor(10000 * Math.random());
    const signedPreKey = await KeyHelper.generateSignedPreKey(
      identityKeyPair,
      signedPreKeyId
    );
    store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
    const publicSignedPreKey: SignedPublicPreKeyType = {
      keyId: signedPreKeyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
    };

    // Now we register this with the server so all users can see them
    const publicPreKey: PreKeyType = {
      keyId: preKey.keyId,
      publicKey: preKey.keyPair.pubKey,
    };

    return {
        registrationId,
        identityPubKey: identityKeyPair.pubKey,
        signedPreKey: publicSignedPreKey,
        oneTimePreKeys: [publicPreKey],
    };
    // updateStory(createidMD);
  };