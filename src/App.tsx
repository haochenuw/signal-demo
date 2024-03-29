import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PubSub from 'pubsub-js'
import ProgressBar from 'react-bootstrap/ProgressBar'
import AppBar from '@mui/material/AppBar';
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import {
    usePopupState,
    bindTrigger,
    bindMenu,
  } from 'material-ui-popup-state/hooks'

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
} from "@material-ui/core";

import { SignalDirectory, FullDirectoryEntry } from "./signal-directory";
import { textDescriptions } from "./components/consts.js"
import ClientView from "./components/ClientView";
import ServerView from "./components/ServerView.js"
import Social, { SocialSubTitle } from "./components/Social";
import { StyledAppBarButton, StyledAppTitle} from "./components/Styled";
import WikiPage from "./components/WikiPage";

const StyledProgressBar = styled(ProgressBar)`
  height: 10px;
  width: 100%;
`;

const pages = ["Home", "Wiki", "About"];

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
    hiddencontainer: {
        display: "none"
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

    // menu popup
    const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })

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
        if (message.message.type === 3) {
            PubSub.publish('discoverTopic', 'decryptPrekeyMessage');
        } else {
            PubSub.publish('discoverTopic', 'decryptNormalMessage');
        }

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

    const handleMenuItemClick = (page: string) => {
        console.log("menu item clicked, " + page)
        setCurrentPage(page)
        popupState.close()
    }

    return (
        <div className="App">
            <AppBar position="sticky">
                <Toolbar>
                    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                        <MenuIcon {...bindTrigger(popupState)} />
                        <Menu
                            {...bindMenu(popupState)}
                            id="menu-appbar"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            sx={{
                                display: { xs: "block", md: "none" }
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={()=>{handleMenuItemClick(page)}}>
                                    <Typography>{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                        <StyledAppTitle>Live Demo of the Signal Protocol</StyledAppTitle>
                        {pages.map((page) => (
                            <StyledAppBarButton
                                key={page}
                                onClick={() => handlePageClick(page)}
                            >
                                {page}
                            </StyledAppBarButton>
                        ))}
                    </Box>
                    <div className="wiki_progress">
                        <span>{`${entriesUnlocked} / ${total} wikis unlocked!`}</span>
                        <StyledProgressBar variant="success" striped={true} now={entriesUnlocked} max={total} min={0} />
                    </div>
                </Toolbar>
            </AppBar>
            <HomePage
                aliceName={aliceName}
                bobName={bobName}
                aHasIdentity={aHasIdentity}
                bHasIdentity={bHasIdentity}
                alicePreKeyBundle={alicePreKeyBundle}
                bobPreKeyBundle={bobPreKeyBundle}
                msgProps={msgProps}
                registerFunc={registerFunc}
                sendMessage={sendMessage}
                getPreKeyBundleFunc={getPreKeyBundleFunc}
                visible={currentPage === "Home"}
                key="home"
            />

            { currentPage === "Wiki" && <WikiPage discoveredTopics={discoveredTopics} /> }
    { currentPage === "About" && <AboutPage /> }

        </div >
    );
}



const AppWithToast = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

export default AppWithToast;

const Paragraph = styled.p`
font-size: 22px;
text-align: left;
color: "black";
margin: 20px;
width: 80%;
`;

const Img = styled.img`
 height: 60px !important;
 width: 217px !important;
`;

function AboutPage(props: any) {
    const info = () => {
        return (
            <>
                <SocialSubTitle>Information</SocialSubTitle>
                <Paragraph>This interactive demo is made by Hao Chen
                    and is available on <a href="https://github.com/haochenuw/signal-demo" target="_blank">github</a>.
                    It is based on the open source implementation of
                    libsignal in <a href="https://github.com/privacyresearchgroup/libsignal-protocol-typescript" target="_blank">typsecript</a> by Privacy Research, and
                    has grown out of the the accompanying <a href="https://github.com/privacyresearchgroup/libsignal-typescript-demo" target="_blank">demo</a>. </Paragraph>
            </>
        )
    }

    const howToUse = () => {
        return (
            <>
                <SocialSubTitle>How To</SocialSubTitle>
                <Paragraph>Click on the buttons to perform operations as signal clients and server, such as registering, initiating sessions and sending messages.</Paragraph>
                <Paragraph>The demo reveals the internals of the Signal protocol, including a detailed representation of each client's session and all the cryptographic keys involved
                    in the protocol. Clicking on them will unlock wiki pages.
                </Paragraph>
                <Paragraph>A cool feature is keys are color-coded based on their raw byte values. So the same key will have the same color. Look for them! </Paragraph>
            </>
        )
    }

    const support = () => {
        return (
            <>
                <SocialSubTitle>Support My Work</SocialSubTitle>
                <Paragraph>This project is completely free and I am paying for the server on my own cost. If you enjoy it, please consider supporting me through the link below: </Paragraph>
                <a href="https://www.buymeacoffee.com/haochen" target="_blank"><Img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" /></a>
            </>
        )
    }
    return (
        <>
            {info()}
            {howToUse()}
            {support()}
            <Social />
        </>
    )
}

function HomePage(props: any) {
    const classes = useStyles();

    return (
        <Grid container className={props.visible === true ? classes.container : classes.hiddencontainer}>
            <Grid item xs={12} lg={4}>
                <ClientView
                    clientName={props.aliceName}
                    otherClientName={props.bobName}
                    getPreKeyBundleFunc={props.getPreKeyBundleFunc}
                    otherHasIdentity={props.bHasIdentity}
                    hasIdentity={props.aHasIdentity}
                    registerFunc={props.registerFunc}
                    sendMessageFunc={props.sendMessage}
                />
            </Grid>
            <Grid item xs={12} lg={4}>
                <ServerView
                    alicePreKeyBundle={props.alicePreKeyBundle}
                    bobPreKeyBundle={props.bobPreKeyBundle}
                    msgProps={props.msgProps} />
            </Grid>
            <Grid item xs={12} lg={4}>
                <ClientView
                    clientName={props.bobName}
                    otherClientName={props.aliceName}
                    getPreKeyBundleFunc={props.getPreKeyBundleFunc}
                    otherHasIdentity={props.aHasIdentity}
                    hasIdentity={props.bHasIdentity}
                    registerFunc={props.registerFunc}
                    sendMessageFunc={props.sendMessage}
                />
            </Grid>
        </Grid>
    )
}
