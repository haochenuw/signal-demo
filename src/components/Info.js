
import React from "react";
import { Typography, Card } from '@mui/material';
import { styled } from '@mui/system';
import { makeStyles } from "@material-ui/core/styles";

const MyDiv = styled('Typography')({
    color: '#ff4400',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    display: 'block', 
    textAlign: 'left', 
    fontSize: "3vh", 
  });

const useStyles = makeStyles({
    root: {
        padding: '0px', 
    },

    title: {
        overflowWrap: "break-word", 
        wordWrap: "break-word", 
    }
});

export default function Info(props){
    const classes = useStyles(); 
    const { graphNode, descriptions, title, ...other } = props;
    return(
        <section>
        <div className={`${classes.root} ${props.className}`} height="100%" flex="1">
        <Typography className={classes.title} variant="h2" align="left">{title}</Typography>
        {props.descriptions.map((item) => (
            <MyDiv>{item}</MyDiv>
        ))}
        {graphNode !== undefined && 
            graphNode
        }
        {graphNode === undefined && <div>No Graph</div>}
        </div>
        </section>
    )
}