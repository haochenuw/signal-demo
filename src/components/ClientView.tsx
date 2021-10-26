import React, { useState, useEffect } from "react";

// material UI imports 
import {
    Paper,
    Grid,
    Avatar,
    Typography,
    Button,
    Chip,
    TextField,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

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
import { getSessionsFrom } from "../util";
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
    
    const otherHasIdentity = props.otherHasIdentity;
    const otherClientAddress = new SignalProtocolAddress(props.otherClientName, 1);

    const createIdentity = async () => {
        let registerPayload = await createID(props.clientName, localStore);
        // directory.storeKeyBundle(name, {
        //     registrationId,
        //     identityPubKey: identityKeyPair.pubKey,
        //     signedPreKey: publicSignedPreKey,
        //     oneTimePreKeys: [publicPreKey],
        //   });
        // console.log(name, `PreKey bundle registered at server`); 
        props.registerFunc(props.clientName, registerPayload); 
        console.log({ "store": localStore });
        setHasIdentity(true);
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
        console.log(props.clientName, "processing prekey bundle from server...");
        await sessionBuilder.processPreKey(prekeyBundle!);
        console.log(props.clientName, "processed prekey bundle from server!");

        // Now we can send an encrypted message
        // const aliceSessionCipher = new SessionCipher(adiStore, recipientAddress);
        setHasSession(true)

        // await updateAllSessions(); 
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

        props.sendMessageFunc(to, from, ciphertext);
        console.log(props.clientName, `message sent!`)

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



    return (
        <Paper className={classes.paper}>
            <Grid container>
                <Grid item xs={9}>
                    <Typography
                        variant="h5"
                        style={{ textAlign: "right", verticalAlign: "top" }}
                        gutterBottom
                    >
                    </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                    <Avatar>A</Avatar>
                </Grid>
                <Grid item xs={12}>
                    {hasIdentity ? (
                        <React.Fragment>
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
                    )}
                </Grid>
                {hasSession ? sendMessageControl(props.otherClientName) : <div />}
                {displayMessages(props.clientName)}
                <Grid item xs={12}>
                    {
                        sessions.map(session => {
                            return <Session name={props.clientName} session={session} />
                        })
                    }
                </Grid>

            </Grid>
        </Paper>
    )
}


