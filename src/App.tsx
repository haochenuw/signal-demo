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
import { ToastProvider, useToasts } from 'react-toast-notifications';

import "./App.css";
import {
    Grid,
    Typography,
    Toolbar,
    Box,
    Button,
} from "@material-ui/core";

import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory, FullDirectoryEntry } from "./signal-directory";
import { textDescriptions } from "./components/consts.js"
import ClientView from "./components/ClientView";
import InfoPanel from "./components/InfoPanel.js";
import ServerView from "./components/ServerView.js"
import { Contactless } from "@material-ui/icons";
import Social from "./components/Social";

const initialStory =
    "# Click on a keyword to learn more";

const StyledProgressBar = styled(ProgressBar)`
  color: palevioletred;
  height: 10px;
  width: 100%; 
`;

const pages = ["Home", "About"];

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

function App() {
    const { addToast } = useToasts()

    const [aHasIdentity, setAHasIdentity] = useState(false);
    const [bHasIdentity, setBHasIdentity] = useState(false);
    const [currentPage, setCurrentPage] = useState("Home");

    const [directory] = useState(new SignalDirectory());
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [discoveredTopics, setDiscoveredTopics] = useState<string[]>([]);
    const [entriesUnlocked, setEntriesUnlocked] = useState(0);
    const [alicePreKeyBundle, setAlicePreKeyBundle] = useState<FullDirectoryEntry | null>(null);
    const [bobPreKeyBundle, setBobPreKeyBundle] = useState<FullDirectoryEntry | null>(null);

    const classes = useStyles();

    const sendMessage = (to: string, from: string, message: MessageType) => {
        const msg = { to, from, message, delivered: false, id: getNewMessageID() };
        setMessages([...messages, msg]);
    };

    const getPreKeyBundleFunc = (name: string) => {
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

    const topicDiscoverHandler = (key: any, topic: string) => {
        console.log('get new topic: ', topic);
        console.log('current topics', discoveredTopics);
        if (discoveredTopics.includes(topic)) {
            console.log('already has topic')
            return;
        } else {
            addToast(`You Unlocked a new Wiki page: ${topic}`, {
                appearance: 'success',
                autoDismiss: true,
                autoDismissTimeout: 5000
            });
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

    useEffect(() => {
        addToast('Demo Toast', { appearance: 'success' });
    }, []);

    const forwardMsg = (message: any) => {
        console.log('forward clicked')
        // publish message to child component
        PubSub.publish('message', message);
        // publish decryption wiki
        PubSub.publish('discoverTopic', 'decryption');

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

    const msgProps = {
        messages: messages,
        forwardMsg: forwardMsg,
        dropMsg: dropMsg
    }

    const total = Object.keys(textDescriptions).length;

    const handlePageClick = (page: string) => {
        setCurrentPage(page)
    }

    const homePage = () => {
        return (<>
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
                        msgProps={msgProps} />
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
                <InfoPanel selectedInfo="registration" discoveredTopics={discoveredTopics} />
            </Box>
        </>)
    }

    return (
        <div className="App">
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" noWrap>Live Demo of the Signal Protocol</Typography>
                    {pages.map((page) => (
                        <Button
                            key={page}
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </Button>
                    ))}
                    <div className="wiki_progress">
                        <span>{`${entriesUnlocked} / ${total} wiki entiries unlocked!`}</span>
                        <StyledProgressBar striped={true} now={entriesUnlocked} max={total} min={0} />
                    </div>
                </Toolbar>
            </AppBar>
            {currentPage === "Home" && homePage()}
            {currentPage === "About" && <AboutPage/>}

        </div>
    );
}



const AppWithToast = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

export default AppWithToast;


const SubTitle = styled.h2`
font-size: 60px;
text-align: left;
color: "black";
margin: 20px; 
`;

const Paragraph = styled.p`
font-size: 25px;
text-align: left;
color: "black";
margin: 20px; 
width: 80%; 
`;

function AboutPage(props: any) {
    const info = () =>
    {
        return (
            <>
            <SubTitle>Info</SubTitle>
            <Paragraph>This interactive demo is made by Hao Chen and is available on <a href="/">github</a>. 
                    It is based on the open source implementation of libsignal in <a href="/">typsecript</a>, and 
                has grown out of the the accompanying <a href="/">demo</a>. </Paragraph>
            </>
         )
    }

    const howToUse = () =>
    {
        return (
            <>
            <SubTitle>How to use</SubTitle>
            <Paragraph>Click the buttons to perform operations as signal clients and server, such as registering, initiating sessions and sending messages</Paragraph>
            <Paragraph>The demo also shows the internals of the Signal protocol, including a detailed presentation of each client's session and all the different types of keys involved
                in the protocol. Clicking on them will unlock wiki pages. 
            </Paragraph>
            </>
         )
    }
    return (
        <>
            {info()}
            {howToUse()}
            <Social/>
        </>
    )
}