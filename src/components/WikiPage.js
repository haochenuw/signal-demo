import React from 'react';
import InfoPanel from "./InfoPanel.js";
import {
    Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
        padding: "10px",
        margin: "25px",
    }
)); 

export default function WikiPage(props){
    const classes = useStyles();
    
    return(
        <Box className={classes.box}>
        <InfoPanel selectedInfo="registration" discoveredTopics={props.discoveredTopics} />
        </Box>
    )
}