import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ReactMarkdown from "react-markdown";
import PubSub from 'pubsub-js'

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

import "./App.css";
import {
    Paper,
    Grid,
    Avatar,
    Typography,
    Button,
    Chip,
    TextField,
} from "@material-ui/core";

import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory, FullDirectoryEntry } from "./signal-directory";

import {getSessionsFrom, tob64Str } from "./util";
import ClientView from "./components/ClientView";
import InfoPanel from "./components/InfoPanel";

const initialStory =
    "# Click on a keyword to learn more";
const createidMD = require("./createid.md");
const startSessionWithAMD = require("./start-session-with-a.md");
const startSessionWithBMD = require("./start-session-with-b.md");
const sendMessageMD = require("./send-message.md");
const sessionMD = require("./markdown/sessions.md");
const registerMD = require("./markdown/register.md");



const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: "auto",
        maxWidth: "90%",
    },
    image: {
        width: 128,
        height: 128,
    },
    container: {
        padding: theme.spacing(2),
    },
    buttonitem: {
        margin: 10,
        padding: 10,
    },
    message: {
        padding: 10,
        backgroundColor: "lightsteelblue",
        margin: 10,
        maxWidth: "90%",
        textAlign: "left",
    },
    outgoingmessage: {
        padding: 10,
        backgroundColor: "linen",
        margin: 10,
        maxWidth: "90%",
    },
    img: {
        margin: "auto",
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
    },
    story: {
        margin: "auto",
        display: "block",
        textAlign: "left",
        fontSize: "10pt",
    },
    preKeyMessage: {
        backgroundColor: "red",
    }, 
    normalMessage: {
    }
}));

interface ChatMessage {
    id: number;
    to: string;
    from: string;
    message: MessageType;
    delivered: boolean;
}

interface ProcessedChatMessage {
    id: number;
    to: string;
    from: string;
    messageText: string;
}

let msgID = 0;

function getNewMessageID(): number {
    return msgID++;
}

const aliceName = "Alice"
const bobName = "Bob"

// define addresses

const aliceAddress = new SignalProtocolAddress(aliceName, 1);
const brunhildeAddress = new SignalProtocolAddress(bobName, 1);

function App() {
    const [adiStore] = useState(new SignalProtocolStore());
    const [brunhildeStore] = useState(new SignalProtocolStore());

    const [aHasIdentity, setAHasIdentity] = useState(false);
    const [bHasIdentity, setBHasIdentity] = useState(false);

    const [directory] = useState(new SignalDirectory());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [processedMessages, setProcessedMessages] = useState<
        ProcessedChatMessage[]
    >([]);

    const [aHasSession, setaHasSession] = useState(false);

    const [adalheidTyping, setAdalheidTyping] = useState("");
    const [brunhildeTyping, setBrunhildeTyping] = useState("");

    const [story, setStory] = useState(initialStory);

    const [aliceIdKeypair, setAliceIdKeypair] = useState(["", ""]);

    const [aliceSessions, setAliceSessions] = useState<SessionType<ArrayBuffer>[]>([]);
    const [bobSessions, setBobSessions] = useState<SessionType<ArrayBuffer>[]>([]);

    const classes = useStyles();

    const updateStory = async (url: string) => {
        const resp = await fetch(url);
        const md = await resp.text();
        setStory(md);
    };

    const sendMessage = (to: string, from: string, message: MessageType) => {
        const msg = { to, from, message, delivered: false, id: getNewMessageID() };
        setMessages([...messages, msg]);
    };

    const getPreKeyBundleFunc = (name:string) => {
        return directory.getPreKeyBundle(name);
    }

    const registerFunc = (name: string, bundle: FullDirectoryEntry) => {
        directory.storeKeyBundle(name, bundle);
        if (name === aliceName) {
            setAHasIdentity(true);
        } else if (name === bobName) {
            setBHasIdentity(true);
        }
    }

    useEffect(()=> {
        // publish a topic asynchronously
        PubSub.publish('MY TOPIC', 'hello world!');
        console.log("published!"); 
    }, []);

    // const readMessage = async (msg: ChatMessage, cipher: SessionCipher) => {
    //     let plaintext: ArrayBuffer = new Uint8Array().buffer;
    //     if (msg.message.type === 3) {
    //         console.log({ preKeyMessage: msg })
    //         //   console.log({ msg });
    //         plaintext = await cipher.decryptPreKeyWhisperMessage(
    //             msg.message.body!,
    //             "binary"
    //         );
    //     } else if (msg.message.type === 1) {
    //         console.log({ normalMessage: msg })
    //         plaintext = await cipher.decryptWhisperMessage(
    //             msg.message.body!,
    //             "binary"
    //         );
    //     }
    //     const stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
    //     console.log(stringPlaintext);

    //     const { id, to, from } = msg;

    //     if (to === aliceName) {
    //         setaHasSession(true);
    //     } else {
    //         setbHasSession(true);
    //     }


    //     await updateAllSessions();

    //     return { id, to, from, messageText: stringPlaintext };
    // };

    const storeSomewhereSafe = (store: SignalProtocolStore) => (
        key: string,
        value: any
    ) => {
        store.put(key, value);
    };

    const createID = async (name: string, store: SignalProtocolStore) => {
        const registrationId = KeyHelper.generateRegistrationId();
        // Store registrationId somewhere durable and safe... Or do this.
        storeSomewhereSafe(store)(`registrationID`, registrationId);

        const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
        // Store identityKeyPair somewhere durable and safe... Or do this.
        storeSomewhereSafe(store)("identityKey", identityKeyPair);

        // const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(identityKeyPair.privKey)))); 

        var priv = Buffer.from(new Uint8Array(identityKeyPair.privKey)).toString('base64');
        var pub = Buffer.from(new Uint8Array(identityKeyPair.pubKey)).toString('base64');

        if (name === "Alice") {
            setAliceIdKeypair([priv, pub]);
        }
        console.log("Hao", `identity key ceated for ${name}`);


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
        directory.storeKeyBundle(name, {
            registrationId,
            identityPubKey: identityKeyPair.pubKey,
            signedPreKey: publicSignedPreKey,
            oneTimePreKeys: [publicPreKey],
        });
        console.log("Hao", `bundle registered at server`);

        updateStory(createidMD);
    };

    const startSessionWithBob = async () => {
        // get Brünhild' key bundle
        const brunhildeBundle = directory.getPreKeyBundle(bobName);
        console.log({ brunhildeBundle });

        const recipientAddress = brunhildeAddress;

        // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
        const sessionBuilder = new SessionBuilder(adiStore, recipientAddress);

        // Process a prekey fetched from the server. Returns a promise that resolves
        // once a session is created and saved in the store, or rejects if the
        // identityKey differs from a previously seen identity for this address.
        console.log("Alice", "processing prekey bundle from server...");
        await sessionBuilder.processPreKey(brunhildeBundle!);

        // Now we can send an encrypted message
        // const aliceSessionCipher = new SessionCipher(adiStore, recipientAddress);
        setaHasSession(true)

        await updateAllSessions();

        updateStory(startSessionWithBMD);
    };

    // Hao: helper function 
    const updateAllSessions = async () => {
        var updatedSessionCipher = getSessionCipherForRemoteAddress(bobName);
        var newSessions = await getSessionsFrom(updatedSessionCipher);
        setAliceSessions(newSessions);
        updatedSessionCipher = getSessionCipherForRemoteAddress(aliceName);
        newSessions = await getSessionsFrom(updatedSessionCipher);
        setBobSessions(newSessions);
    }

    const displayMessages = (sender: string) => {
        return processedMessages.map((m) => (
            <React.Fragment>
                {m.from === sender ? <Grid xs={2} item /> : <div />}
                <Grid xs={10} item key={m.id}>
                    <Paper
                        className={
                            m.from === sender ? classes.outgoingmessage : classes.message
                        }
                    >
                        <Typography variant="body1">{m.messageText}</Typography>
                    </Paper>
                </Grid>
                {m.from !== sender ? <Grid xs={2} item /> : <div />}
            </React.Fragment>
        ));
    };

    function showPendingMessages() {
        return  (
            <Grid container spacing={2}>            
                <Grid xs={12} item>
                <Typography>Pending Messages</Typography>
                </Grid>
                {pendingMessageBody()}
            </Grid>
        )
    };

    const pendingMessageBody = () => {
       return messages.map((m) => (
            <React.Fragment>
                <Grid xs = {6} item key={m.id}>
                    <Paper className={
                        m.message.type === 3 ? classes.preKeyMessage : classes.normalMessage
                    }>
                        <Typography variant="body1">{m.from} - {m.to}; Id: {m.id}; Type:{m.message.type} </Typography>
                    </Paper>
                </Grid>
                <Grid xs = {2} item>
                    <Button onClick={() => forwardMsg(m)}>Forward</Button>
                </Grid>
                <Grid xs = {2} item>
                    <Button onClick={() => dropMsg(m)}>Drop</Button>
                </Grid>
            </React.Fragment>
       ))
    }; 

    const forwardMsg = (message: any) => {
        console.log('forward clicked')
        // publish message to child component
        PubSub.publish('message', message);

        // remove message 
        const index = messages.indexOf(message);
        if (index > -1) {
          messages.splice(index, 1);
          setMessages([...messages]); 
        }
    }

    const dropMsg = (message: any) => {
        console.log('drop message clicked')
        messages.shift()
        setMessages([...messages]);
    }

    const getSessionCipherForRemoteAddress = (to: string) => {
        // send from Brünhild to adalheid so use his store
        const store = to === aliceName ? brunhildeStore : adiStore;
        const address = to === aliceName ? aliceAddress : brunhildeAddress;
        return new SessionCipher(store, address);
    };

    const encryptAndSendMessage = async (to: string, message: string) => {
        console.log(`sending a encrypted message to ${to}`)
        const cipher = getSessionCipherForRemoteAddress(to);
        const from = to === aliceName ? bobName : aliceName;
        const ciphertext = await cipher.encrypt(
            new TextEncoder().encode(message).buffer
        );
        if (from === aliceName) {
            setAdalheidTyping("");
        } else {
            setBrunhildeTyping("");
        }
        sendMessage(to, from, ciphertext);
        updateStory(sendMessageMD);
        await updateAllSessions();
    };

    return (
        <div className="App">
            <Paper className={classes.paper}>
                <Grid container spacing={2} className={classes.container}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h3" gutterBottom>
                                Live Demo of the Signal Protocol!
                            </Typography>
                            
                            <Button variant="contained" color='primary' onClick={() => {updateStory(registerMD)}}>Overview</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(registerMD)}}>registration</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(sessionMD)}}>session</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(sessionMD)}}>initialize a session</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(sessionMD)}}>Message Keys</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(sessionMD)}}>Chain</Button>
                            <Button variant="contained" color='primary' onClick={() => {updateStory(sessionMD)}}>RootKey</Button>
                            
                            {/* <ReactMarkdown
                                source={story}
                                className={classes.story}
                                renderers={{ code: CodeBlock }}
                            /> */}
                            {showPendingMessages()}
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <ClientView
                            clientName={aliceName}
                            otherClientName={bobName}
                            getPreKeyBundleFunc={getPreKeyBundleFunc}
                            otherHasIdentity={bHasIdentity}
                            registerFunc={registerFunc}
                            sendMessageFunc={sendMessage}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <ClientView
                            clientName={bobName}
                            otherClientName={aliceName}
                            getPreKeyBundleFunc={getPreKeyBundleFunc}
                            otherHasIdentity={aHasIdentity}
                            registerFunc={registerFunc}
                            sendMessageFunc={sendMessage}
                        />
                    </Grid>

                </Grid>
            </Paper>
            <InfoPanel selectedInfo="registration"/>
        </div>
    );
}

export default App;
