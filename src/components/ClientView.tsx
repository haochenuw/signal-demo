import React, { useState, useEffect } from "react";
import PubSub from 'pubsub-js'
import Key from "./Key.js"

// material UI imports 
import {
    Paper,
    Grid,
    Typography,
    Button,
    Chip,
    TextField,
    Tabs, 
    Tab
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import {
    KeyPairType,
} from "@privacyresearch/libsignal-protocol-typescript";
import { makeStyles } from "@material-ui/core/styles";

import { SignalDirectory, FullDirectoryEntry} from "../signal-directory";
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
import { SignalProtocolStore } from "../storage-type";
import { createID } from "../utils";
import { getSessionsFrom, readMessage, ChatMessage} from "../util";
import Session from "./Session";

interface ProcessedChatMessage {
    id: number;
    to: string;
    from: string;
    messageText: string;
}


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
}));

interface Props {
    clientName: string, 
    otherClientName: string, 
    otherHasIdentity: boolean, 
    getPreKeyBundleFunc: (name: string) => any, 
    registerFunc: (name: string, bundle: FullDirectoryEntry) => void, 
    sendMessageFunc: (to: string, from: string, message: MessageType) => void, 
}

export default function ClientView(props: Props) {
    const classes = useStyles();
    const [hasIdentity, setHasIdentity] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [localStore] = useState(new SignalProtocolStore());
    const [processedMessages, setProcessedMessages] = useState<
        ProcessedChatMessage[]
    >([]);
    const [draftMessage, setDraftMessage] = useState("");
    const [sessions, setSessions] = useState<SessionType<ArrayBuffer>[]>([]);

    const [incomingMessages, setIncomingMessages] = useState<ChatMessage[]>([]); 
    const [processing, setProcessing] = useState(false);
    
    const [identityKeypair, setIdentityKeypair] = useState<KeyPairType | null>(null);  
    const otherHasIdentity = props.otherHasIdentity;
    const otherClientAddress = new SignalProtocolAddress(props.otherClientName, 1);

    const getSessionCipher = () => {
        return new SessionCipher(localStore, otherClientAddress);
    };

    const messageHandler = (topic: any, message: ChatMessage) => {
        // if not for me, skip 
        if (message.to !== props.clientName){
            return; 
        }
        setIncomingMessages([...incomingMessages, message]);
    }
    
    async function fetchIdentityKey(){
        const IKa = await localStore.getIdentityKeyPair();
        if (IKa !== undefined){
            console.log("setting id keypair")
            setIdentityKeypair(IKa);
        }
    }
    // useEffect(()=> {
    //     fetchIdentityKey(); 
    // }, );

    useEffect(()=>{
        var subscription = PubSub.subscribe('message', messageHandler);
    }, []);

    useEffect(() => {
        if (processing) {
            // do nothing 
            return;
        }
        const doProcessing = async () => {
            while (incomingMessages.length > 0) {
                const nextMsg = incomingMessages.shift();
                if (!nextMsg) {
                    continue;
                }
                const cipher = getSessionCipher();
                if( hasSession === false ){
                    setHasSession(true)
                }
                const processed = await readMessage(nextMsg, cipher);
                processedMessages.push(processed);
                
            }
            setProcessedMessages([...processedMessages]);
            setIncomingMessages([...incomingMessages]);
        }
        setProcessing(true); 
        doProcessing().then(
            () => { 
                setProcessing(false);             
                updateAllSessions();
            }
        );
    }, [incomingMessages]);

    const createIdentity = async () => {
        let registerPayload = await createID(props.clientName, localStore);
        props.registerFunc(props.clientName, registerPayload); 
        setHasIdentity(true);
        PubSub.publish('discoverTopic', 'registration');
        fetchIdentityKey();
    };

    const getSessionCipherForRemoteAddress = () => {
        return new SessionCipher(localStore, otherClientAddress);
    };

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

    const updateAllSessions = async () => {
        var updatedSessionCipher = getSessionCipherForRemoteAddress();
        var newSessions = await getSessionsFrom(updatedSessionCipher);
        setSessions(newSessions);
    }

    const startSessionWithOther = async () => {
        const prekeyBundle = props.getPreKeyBundleFunc(props.otherClientName);
        console.log({"Hao: prekey bundle": prekeyBundle});
        const recipientAddress = otherClientAddress;
        if (prekeyBundle === undefined) {
            console.error("Problem -- other client has not registered yet!")
            return; 
        }

        // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
        const sessionBuilder = new SessionBuilder(localStore, recipientAddress);

        // Process a prekey fetched from the server. Returns a promise that resolves
        // once a session is created and saved in the store, or rejects if the
        // identityKey differs from a previously seen identity for this address.
        await sessionBuilder.processPreKey(prekeyBundle!);
        console.log(props.clientName, "processed prekey bundle from server!");

        // Now we can send an encrypted message
        // const aliceSessionCipher = new SessionCipher(adiStore, recipientAddress);
        setHasSession(true)
        await updateAllSessions() 
        PubSub.publish('discoverTopic', 'x3dh');
        // updateStory(startSessionWithBMD);        
    }

    const encryptAndSendMessage = async (to: string, message: string) => {
        console.log(props.clientName, `sending a encrypted message to ${to}...`)
        const from = props.clientName; 
        const cipher = getSessionCipherForRemoteAddress();
        const ciphertext = await cipher.encrypt(
            new TextEncoder().encode(message).buffer
        );
        setDraftMessage(""); 
        PubSub.publish('discoverTopic', 'encryption');

        props.sendMessageFunc(to, from, ciphertext);
        
        console.log(props.clientName, `message sent!`)

        const localMessage = {
            id: 0, 
            to: to, 
            from: props.clientName, 
            messageText: message 
        }
        setProcessedMessages([...processedMessages, localMessage]); 
        // updateStory(sendMessageMD);
        await updateAllSessions();
    };

    const sendMessageControl = (to: string) => {
        const value = draftMessage;
        const onTextChange = setDraftMessage; 
        return (
            <Grid item xs={12} key="input">
                <Paper className={classes.paper}>
                    <TextField
                        id="outlined-multiline-static"
                        label={`Message ${to}`}
                        multiline
                        value={value}
                        onChange={(event) => {
                            onTextChange(event.target.value);
                        }}
                        variant="outlined"
                    ></TextField>
                    <Button
                        onClick={() => encryptAndSendMessage(to, value)}
                        variant="contained"
                        className={classes.buttonitem}
                    >
                        {" "}
                        <SendIcon />
                    </Button>
                </Paper>
            </Grid>
        );
    };

    const [selectedTab, setSelectedTab] = useState(0); 
    const handleChange = (_: any, newValue: number) => {
        setSelectedTab(newValue);
        if (newValue == 2){
            PubSub.publish('discoverTopic', 'session');
        }
    };

    const handleIdentityKeyClick = () => {
        PubSub.publish('discoverTopic', 'identityKey');
    }

    const identityPanel = () => {
        
        return hasIdentity ? (
            <React.Fragment>
                <h2 onClick={() => handleIdentityKeyClick()}>Identity Key</h2>
                <Key desc={"identity private key "} keyArray = {identityKeypair?.privKey}/>
                <Key desc={"identity public key "} keyArray = {identityKeypair?.pubKey}/>
                <Chip
                    label={`${props.clientName}'s Registration ID: ${localStore.get(
                        "registrationID",
                        ""
                    )}`}
                ></Chip>
                {hasSession || !(hasIdentity && otherHasIdentity) ? (
                    <div></div>
                ) : (
                    <Button
                        className={classes.buttonitem}
                        variant="contained"
                        onClick={startSessionWithOther}
                    >
                        Start session with {props.otherClientName}
                    </Button>
                )}
            </React.Fragment>
        ) : (
            <Button
                className={classes.buttonitem}
                variant="contained"
                onClick={createIdentity}
            >
                Create an identity for {props.clientName}
            </Button>
        )
    }

    const messagePanel = () => {
        return (
            <>
            {hasSession ? sendMessageControl(props.otherClientName) : <div />}
            {displayMessages(props.clientName)}
            </>
        )
    }

    const sessionsPanel = () => {
        return sessions.map(session => {
            return <Session key={session} name={props.clientName} session={session} />
        })
    }

    return (
        <Paper className={classes.paper}>
            <Grid container>
                <Tabs value={selectedTab} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Basic Info"/>
                    <Tab label="Messaging"/>
                    <Tab label="Sessions"/>
                </Tabs>
                <Grid item xs={12}>
                    {selectedTab === 0 && identityPanel()}
                    {selectedTab === 1 && messagePanel()}
                    {selectedTab === 2 && sessionsPanel()}
                </Grid>

            </Grid>
        </Paper>
    )
}


