import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ReactMarkdown from "react-markdown";

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
import SendIcon from "@material-ui/icons/Send";

import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory } from "./signal-directory";
import CodeBlock from "./code-block";
import Key from "./components/Key";
import Session from "./components/Session";

import { doStuff, getSessionsFrom, tob64Str } from "./util";
import { isConstructorDeclaration } from "typescript";

const initialStory =
  "# Start using the demo to see what is happening in the code";
const createidMD = require("./createid.md");
const startSessionWithAMD = require("./start-session-with-a.md");
const startSessionWithBMD = require("./start-session-with-b.md");
const sendMessageMD = require("./send-message.md");

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

  const [hasSession, setHasSession] = useState(false);

  const [adalheidTyping, setAdalheidTyping] = useState("");
  const [brunhildeTyping, setBrunhildeTyping] = useState("");

  const [processing, setProcessing] = useState(false);
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

  useEffect(() => {
    if (!messages.find((m) => !m.delivered) || processing) {
      return;
    }

    const getReceivingSessionCipherForRecipient = (to: string) => {
      // send from Brünhild to Adalheid so use his store
      const store = to === bobName ? brunhildeStore : adiStore;
      const address = to === bobName ? aliceAddress : brunhildeAddress;
      return new SessionCipher(store, address);
    };

    const doProcessing = async () => {
      while (messages.length > 0) {
        const nextMsg = messages.shift();
        if (!nextMsg) {
          continue;
        }
        const cipher = getReceivingSessionCipherForRecipient(nextMsg.to);
        const processed = await readMessage(nextMsg, cipher);
        processedMessages.push(processed);
      }
      setMessages([...messages]);
      setProcessedMessages([...processedMessages]);
    };
    setProcessing(true);
    doProcessing().then(() => {
      setProcessing(false);
    });
  }, [adiStore, brunhildeStore, messages, processedMessages, processing]);

  const readMessage = async (msg: ChatMessage, cipher: SessionCipher) => {
    let plaintext: ArrayBuffer = new Uint8Array().buffer;
    if (msg.message.type === 3) {
      console.log({preKeyMessage: msg})
      //   console.log({ msg });
      plaintext = await cipher.decryptPreKeyWhisperMessage(
        msg.message.body!,
        "binary"
      );
      setHasSession(true);
    } else if (msg.message.type === 1) {
      console.log({normalMessage: msg})
      plaintext = await cipher.decryptWhisperMessage(
        msg.message.body!,
        "binary"
      );
    }
    const stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
    console.log(stringPlaintext);

    const { id, to, from } = msg;

    await updateAllSessions();

    return { id, to, from, messageText: stringPlaintext };
  };

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

    if (name === "Alice"){
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

  const createAliceIdentity = async () => {
    await createID("Alice", adiStore);
    console.log({ adiStore });
    setAHasIdentity(true);
  };

  const createBrunhildeIdentity = async () => {
    await createID(bobName, brunhildeStore);
    setBHasIdentity(true);
  };

  const starterMessageBytes = Uint8Array.from([
    0xce,
    0x93,
    0xce,
    0xb5,
    0xce,
    0xb9,
    0xce,
    0xac,
    0x20,
    0xcf,
    0x83,
    0xce,
    0xbf,
    0xcf,
    0x85,
  ]);

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
    console.log("Alice",  "processing prekey bundle from server...");
    await sessionBuilder.processPreKey(brunhildeBundle!);

    // Now we can send an encrypted message
    const aliceSessionCipher = new SessionCipher(adiStore, recipientAddress);
    console.log("Alice",  "encrypting a message to bob...");
    const ciphertext = await aliceSessionCipher.encrypt(
      starterMessageBytes.buffer
    );
    let newAliceSessions = await getSessionsFrom(aliceSessionCipher); 
    // const sessionRecord = await aliceSessionCipher.getRecordPublic(); 
    // console.log("Alice session record", sessionRecord); 

    // const sessions = sessionRecord?.getSessions(); 
    // newAliceSessions = await getSessionsFrom(aliceSessionCipher); 
    // setAliceSessions(newAliceSessions);  


    sendMessage(bobName, aliceName, ciphertext);
    // newAliceSessions = await getSessionsFrom(aliceSessionCipher); 
    // setAliceSessions(newAliceSessions);  

    await updateAllSessions(); 

    updateStory(startSessionWithBMD);
  };

  const startSessionWithAlice = async () => {
    // get Adalheid's key bundle
    const aliceBundle = directory.getPreKeyBundle(aliceName);
    console.log({ adalheidBundle: aliceBundle });

    const recipientAddress = aliceAddress;

    // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
    const sessionBuilder = new SessionBuilder(brunhildeStore, recipientAddress);

    // Process a prekey fetched from the server. Returns a promise that resolves
    // once a session is created and saved in the store, or rejects if the
    // identityKey differs from a previously seen identity for this address.
    console.log("brünhild processing prekey");
    await sessionBuilder.processPreKey(aliceBundle!);

    // Now we can send an encrypted message
    const brunhildeSessionCipher = new SessionCipher(
      brunhildeStore,
      recipientAddress
    );
    const ciphertext = await brunhildeSessionCipher.encrypt(
      starterMessageBytes.buffer
    );

    sendMessage(aliceName, bobName, ciphertext);
    await updateAllSessions()
    updateStory(startSessionWithAMD);
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

  const getSessionCipherForRemoteAddress = (to: string) => {
    // send from Brünhild to adalheid so use his store
    const store = to === aliceName ? brunhildeStore : adiStore;
    const address = to === aliceName ? aliceAddress : brunhildeAddress;
    return new SessionCipher(store, address);
  };

//   const updateSessionInfo = async () => {
//       let aliceSessionCipher = getSessionCipherForRecipient(aliceName);
//       let newAliceSessions = await getSessionsFrom(aliceSessionCipher); 
//       setAliceSessions(newAliceSessions); 
//   }

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

  const sendMessageControl = (to: string) => {
    const value = to === aliceName ? brunhildeTyping : adalheidTyping;
    const onTextChange =
      to === aliceName ? setBrunhildeTyping : setAdalheidTyping;
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
    <div className="App">
      <Paper className={classes.paper}>
          Hao's stuff here
          {aHasIdentity && <Key keyDesc="Alice identity priv" keyBase64Str={aliceIdKeypair[0]}/>}
          {aHasIdentity && <Key keyDesc="Alice identity pub" keyBase64Str={aliceIdKeypair[1]}/>}
      </Paper>
      <Paper className={classes.paper}>
      <Grid container spacing={2} className={classes.container}>
          <Grid item xs={10}>
              {
                aliceSessions.map(session => {
                    return <Session name={"Alice"} session={session}/>
                })
              }
          </Grid>
          <Grid item xs={10}>
              {
                bobSessions.map(session => {
                    return <Session name={"Bob"} session={session}/>
                })
              }
          </Grid>
      </Grid>
      
      </Paper>
      <Paper className={classes.paper}>
        <Grid container spacing={2} className={classes.container}>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xs={9}>
                  <Typography
                    variant="h5"
                    style={{ textAlign: "right", verticalAlign: "top" }}
                    gutterBottom
                  >
                    Alice's View
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                  <Avatar>A</Avatar>
                </Grid>
                <Grid item xs={12}>
                  {aHasIdentity ? (
                    <React.Fragment>
                      <Chip
                        label={`${aliceName} Registration ID: ${adiStore.get(
                          "registrationID",
                          ""
                        )}`}
                      ></Chip>
                      {hasSession || !(aHasIdentity && bHasIdentity) ? (
                        <div />
                      ) : (
                        <Button
                          className={classes.buttonitem}
                          variant="contained"
                          onClick={startSessionWithBob}
                        >
                          Start session with Brünhild
                        </Button>
                      )}
                    </React.Fragment>
                  ) : (
                    <Button
                      className={classes.buttonitem}
                      variant="contained"
                      onClick={createAliceIdentity}
                    >
                      Create an identity for Alice
                    </Button>
                  )}
                </Grid>
                {hasSession ? sendMessageControl(bobName) : <div />}
                {displayMessages(aliceName)}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Typography variant="h3" component="h3" gutterBottom>
                {aliceName} talks to Brünhild
              </Typography>
              <ReactMarkdown
                source={story}
                className={classes.story}
                renderers={{ code: CodeBlock }}
              />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xs={2}>
                  <Avatar>B</Avatar>
                </Grid>
                <Grid item xs={10}>
                  <Typography
                    variant="h5"
                    style={{ textAlign: "left", verticalAlign: "top" }}
                    gutterBottom
                  >
                    Brünhild's View
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {bHasIdentity ? (
                    <React.Fragment>
                      <Chip
                        label={`Brünhild's Registration ID: ${brunhildeStore.get(
                          "registrationID",
                          ""
                        )}`}
                      ></Chip>
                      {hasSession || !(aHasIdentity && bHasIdentity) ? (
                        <div />
                      ) : (
                        <Button
                          className={classes.buttonitem}
                          variant="contained"
                          onClick={startSessionWithAlice}
                        >
                          Start session with Adalheid
                        </Button>
                      )}
                    </React.Fragment>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={createBrunhildeIdentity}
                    >
                      Create an identity for Brünhild
                    </Button>
                  )}
                </Grid>
                {hasSession ? sendMessageControl(aliceName) : <div />}
                {displayMessages(bobName)}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default App;
