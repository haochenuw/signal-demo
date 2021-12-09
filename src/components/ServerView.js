// export interface FullDirectoryEntry {
//     registrationId: number
//     identityPubKey: ArrayBuffer
//     signedPreKey: SignedPublicPreKeyType
//     oneTimePreKeys: PreKeyType[]
// }
// export interface PreKeyType<T = ArrayBuffer> {
//     keyId: number
//     publicKey: T
// }

// export interface SignedPublicPreKeyType<T = ArrayBuffer> extends PreKeyType<T> {
//     signature: T
// }
import Key from "./Key.js"
import React from "react"
import PubSub from 'pubsub-js'
import {Title, SubTitle} from './Styled.js'
import styled from 'styled-components'
import { makeStyles } from "@material-ui/core/styles";



import {
    Paper,
    Grid,
    Button,
} from "@material-ui/core";
import SignalMessage from "./SignalMessage.js"

const ForwardDropButton = styled(Button)`
  background-color: blue; 
  border-radius: 5px; 
  margin: 5px; 
  padding: 10px; 
  height: 40px; 
  font-size: 18px;
`;

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        margin: "auto",
        maxWidth: "90%",
    },
    message: {
        padding: 10,
        backgroundColor: "lightsteelblue",
        margin: 10,
        maxWidth: "90%",
        textAlign: "left",
    },
}));
export default function ServerView(props) {
    const classes = useStyles();

    return(
        <Paper className={classes.paper}>
            <Title>Server View</Title>
            {props.alicePreKeyBundle !== null && <PreKeyBundle 
                client={"Alice"}
                data = {props.alicePreKeyBundle}/>}
            {props.bobPreKeyBundle !== null && <PreKeyBundle 
                client={"Bob"}
                data = {props.bobPreKeyBundle}/>}
            <PendingMessages msgProps = {props.msgProps}/>
        </Paper>
    )
}

function PendingMessages(props) {
    const {msgProps} = props; 
    const {messages, forwardMsg, dropMsg} = msgProps; 
    return  (
        <Grid container spacing={2}>            
            <Grid item xs={12}>
                <SubTitle>Pending Messages</SubTitle>
            </Grid>
            {
            messages.map((m) => (
                    <>
                    <Grid xs = {6} item key={m.id}>
                        <SignalMessage m={m}/>
                    </Grid>
                    <Grid xs = {3} item>
                        <ForwardDropButton onClick={() => forwardMsg(m)}>Forward</ForwardDropButton>
                    </Grid>
                    <Grid xs = {3} item>
                        <ForwardDropButton onClick={() => dropMsg(m)}>Drop</ForwardDropButton>
                    </Grid>
                    </>
                ))
            }
        </Grid>
    )
};


function PreKeyBundle(props) {
    return (
        <>
        <SubTitle>{props.client}'s Prekey Bundle</SubTitle>
        <Key onClick={() => PubSub.publish('discoverTopic', 'preKeyBundle')} desc={"identity public key"} keyArray = {props.data.identityPubKey}/>
        <Key desc={"signed prekey"} keyArray = {props.data.signedPreKey.publicKey}/>
        </>
    )
}