import React from "react"

// Chain protobuf definition
/*
  message Chain {
        optional bytes senderRatchetKey: pk 
        optional bytes senderRatchetKeyPrivate: sk
        optional ChainKey chainKey: ck
        repeated MessageKey messageKeys: null;
    }
*/


// export interface Chain<T> {
//     chainType: ChainType
//     chainKey: { key: T; counter: number }
//     messageKeys: { [key: number]: T }
// }

import {
    ChainType
} from "@privacyresearch/libsignal-protocol-typescript";

import { tob64Str } from "../util";

import {
    List,
    Grid,
    ListSubheader
} from "@material-ui/core";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Key from "./Key.js"

export default function Chain(props) {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <List
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Chain
                        </ListSubheader>
                    }
                >
                    <ListItem>
                        <ListItemText primary={`Chain Type: ${ChainType[props.chain.chainType]}`} />
                    </ListItem>
                    <ListItem>
                        <Key desc={"chain key"} keyArray = {props.chain.chainKey.key}/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={`ChainKey Counter: ${props.chain.chainKey.counter}`} />
                    </ListItem>
                    <ListItem button onClick={handleClick}>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary="Message Keys" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {Object.keys(props.chain.messageKeys).map(id => (
                                <ListItem
                                    button
                                    dense
                                    role={undefined}
                                >
                                    <ListItemText primary={`id: ${id}, key: ${ (props.chain.messageKeys[id])}`} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </Grid>
        </Grid>
    )
}