import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PubSub from 'pubsub-js'
import ProgressBar from 'react-bootstrap/ProgressBar'
import 'bootstrap/dist/css/bootstrap.min.css'; // Needed for progress bar to show up!
import {
    KeyHelper,
    SignedPublicPreKeyType,
    SignalProtocolAddress,
    SessionBuilder,
    PreKeyType,
    SessionCipher,
    MessageType,
} from "@privacyresearch/libsignal-protocol-typescript";
import styled from 'styled-components'

import "./App.css";
import {
    Paper,
    Grid,
    Typography,
    Button,
} from "@material-ui/core";

import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory, FullDirectoryEntry } from "./signal-directory";

import {getSessionsFrom} from "./util";
import ClientView from "./components/ClientView";
import InfoPanel from "./components/InfoPanel.js";
import ServerView from "./components/ServerView.js"
import SignalMessage from "./components/SignalMessage.js"

const initialStory =
    "# Click on a keyword to learn more";
const createidMD = require("./createid.md");
const startSessionWithBMD = require("./start-session-with-b.md");

const StyledProgressBar = styled(ProgressBar)`
  color: palevioletred;
  font-weight: bold;
  height: 50px;
  font-size: 40px;
  width: 100%; 
`;

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
    const [discoveredTopics, setDiscoveredTopics] = useState<string[]>([]); 
    const [entriesUnlocked, setEntriesUnlocked] = useState(0); 
    const [alicePreKeyBundle, setAlicePreKeyBundle] = useState<FullDirectoryEntry | null>(null); 
    const [bobPreKeyBundle, setBobPreKeyBundle] = useState<FullDirectoryEntry | null>(null); 
    
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
            setAlicePreKeyBundle(bundle); 
            console.log('got here -- pre key bundle')
        } else if (name === bobName) {
            setBHasIdentity(true);
            setBobPreKeyBundle(bundle); 
        }
    }

    const topicDiscoverHandler = (key: any, topic:string) => {
        console.log('get new topic: ', topic); 
        console.log('current topics', discoveredTopics); 
        if (discoveredTopics.includes(topic)){
            console.log('already has topic')
            return; 
        } else{
            console.log('does not have topic')
            console.log(discoveredTopics)
            setEntriesUnlocked((entriesUnlocked) => entriesUnlocked + 1); 
            setDiscoveredTopics([...discoveredTopics, topic]);
            // TODO set active panel
        }
    }

    useEffect(() => {
        PubSub.unsubscribe('discoverTopic');
        var subscription = PubSub.subscribe('discoverTopic', topicDiscoverHandler);
    }, [discoveredTopics]);


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
        updatedSessionCipher = getSessionCipherForRemoteAddress(aliceName);
        newSessions = await getSessionsFrom(updatedSessionCipher);
    }

    function showPendingMessages() {
        return  (
            <Grid container spacing={2}>            
                <Grid xs={12} item>
                <Typography variant="h2">Pending Messages</Typography>
                </Grid>
                {pendingMessageBody()}
            </Grid>
        )
    };

    const pendingMessageBody = () => {
       return messages.map((m) => (
            <Grid container>
                <Grid xs = {6} item key={m.id}>
                    <SignalMessage m={m}/>
                </Grid>
                <Grid xs = {2} item>
                    <Button onClick={() => forwardMsg(m)}>Forward</Button>
                </Grid>
                <Grid xs = {2} item>
                    <Button onClick={() => dropMsg(m)}>Drop</Button>
                </Grid>
            </Grid>
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

    const total = 20; 

    return (
        <div className="App">
            <Paper className={classes.paper}>
                <Grid container className={classes.container}>
                    <Grid item xs={12}>
                        <Typography variant="h3" component="h3" gutterBottom>
                            Live Demo of the Signal Protocol!
                        </Typography>
                        {showPendingMessages()}
                        <Typography variant="h4">{`${entriesUnlocked} wiki entiries unlocked!`}</Typography>
                        <StyledProgressBar striped={true} now={entriesUnlocked} max={total} min={0}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ClientView
                            clientName={aliceName}
                            otherClientName={bobName}
                            getPreKeyBundleFunc={getPreKeyBundleFunc}
                            otherHasIdentity={bHasIdentity}
                            registerFunc={registerFunc}
                            sendMessageFunc={sendMessage}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <ServerView alicePreKeyBundle={alicePreKeyBundle} bobPreKeyBundle={bobPreKeyBundle}/>
                    </Grid>
                    <Grid item xs={4}>
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
            <InfoPanel selectedInfo="registration" discoveredTopics = {discoveredTopics}/>
            </Paper>
        </div>
    );
}

export default App;
