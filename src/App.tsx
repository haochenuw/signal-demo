import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PubSub from 'pubsub-js'
import ProgressBar from 'react-bootstrap/ProgressBar'
import AppBar from '@mui/material/AppBar';

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
    Grid,
    Typography,
    Toolbar,
    Box, 
} from "@material-ui/core";

import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory, FullDirectoryEntry } from "./signal-directory";

import {getSessionsFrom} from "./util";
import ClientView from "./components/ClientView";
import InfoPanel from "./components/InfoPanel.js";
import ServerView from "./components/ServerView.js"

const initialStory =
    "# Click on a keyword to learn more";
const createidMD = require("./createid.md");

const StyledProgressBar = styled(ProgressBar)`
  color: palevioletred;
  height: 10px;
  width: 100%; 
`;

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: "8px",
        margin: "auto",
        maxWidth: "90%",
    },
    image: {
        width: 128,
        height: 128,
    },
    box: {
        padding: "10px", 
        margin: "25px", 
    }, 
    container: {
        padding: 0,
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

    const [aHasSession, setaHasSession] = useState(false);

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
            console.log('discovering a new topic')
            console.log(discoveredTopics)
            setEntriesUnlocked((entriesUnlocked) => entriesUnlocked + 1); 
            setDiscoveredTopics([...discoveredTopics, topic]);
            // TODO set active panel
            PubSub.publish('activeTopic', topic);
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

    // Hao: helper function 
    const updateAllSessions = async () => {
        var updatedSessionCipher = getSessionCipherForRemoteAddress(bobName);
        var newSessions = await getSessionsFrom(updatedSessionCipher);
        updatedSessionCipher = getSessionCipherForRemoteAddress(aliceName);
        newSessions = await getSessionsFrom(updatedSessionCipher);
    }

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

    const msgProps = {
        messages: messages, 
        forwardMsg: forwardMsg, 
        dropMsg: dropMsg
    }

    const total = 20; 

    return (
        <div className="App">
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" noWrap>Live Demo of the Signal Protocol</Typography>
                    <div className="wiki_progress">
                        <span>{`${entriesUnlocked} / ${total} wiki entiries unlocked!`}</span>
                        <StyledProgressBar striped={true} now={entriesUnlocked} max={total} min={0}/>
                    </div>
                </Toolbar>
            </AppBar>
                <Grid container className={classes.container}>
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
                        <ServerView 
                        alicePreKeyBundle={alicePreKeyBundle} 
                        bobPreKeyBundle={bobPreKeyBundle}
                        msgProps={msgProps}/>
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
            <Box className={classes.box}>
            <InfoPanel selectedInfo="registration" discoveredTopics = {discoveredTopics}/>
            </Box>
        </div>
    );
}

export default App;
