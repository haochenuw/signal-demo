import React, { useState, useEffect} from "react";
import Info from "./Info"

import { styled } from '@material-ui/core/styles';
import {textDescriptions, graphDefs} from "./consts"
import {
    Tabs, 
    Tab,
    Grid,
    Paper, 
} from "@material-ui/core";
import BeautifulDiagram from "./BeautifulDiagram";
import { makeStyles } from "@material-ui/core/styles";
import {Box} from "@material-ui/core"; 
import LockIcon from '@material-ui/icons/Lock';
import { withStyles } from "@material-ui/core/styles";
import {Title, SubTitle} from './Styled.js'
import "../styles/styles.css"
const StyledTab = styled(Tab)({
    borderBottom: '1px solid #e8e8e8',
    backgroundColor: '#103174',
    borderRadius: "5px", 
    color: "white"
});

const useStyles = makeStyles({
    box: {
        "margin-left": '25px', 
    },

    tab: {
        borderBottom: '1px solid #e8e8e8',
        backgroundColor: '#1890ff',
        borderRadius: "5px"
    }, 

});


const topicsMetadata = [
    {
        key: "registration", 
        title: "Registration", 
    }, 
    {
        key: "preKeyBundle", 
        title: "PreKey Bundle", 
    }, 
    {
        key: "x3dh", 
        title: "X3DH",  
    },
    {
        key: "session", 
        title: "Session",  
    },
    {
        key: "rootKey", 
        title: "Root Key",  
    },
    {
        key: "ratchet", 
        title: "Ratchet",  
    },
    {
        key: "chain", 
        title: "Chain",  
    },
    {
        key: "preKeyMessage", 
        title: "PreKey Message",  
    },
    {
        key: "whisperMessage", 
        title: "Whisper Message",  
    },
    {
        key: "encryption", 
        title: "Encryption",  
    },
    {
        key: "decryption", 
        title: "Decryption",  
    },
    {
        key: "chainKey", 
        title: "Chain Key",  
    },
    {
        key: "messageKey", 
        title: "Message Key",  
    },
    {
        key: "identityKey", 
        title: "Identity Key",  
    },
]

export default function InfoPanel(props) {
    
    const [selectedTab, setSelectedTab] = useState(0); 

    const [readTopics, setReadTopics] = useState({}); 

    const handleChange = (_, newValue) => {
        setSelectedTab(newValue);
    };

    const classes = useStyles(); 

    const tab = (label) => {
        return (
            <div>{label}</div>
        )
    }

    return (
    <Paper>
    <Grid container justifyContent="center" direction="row" spacing={10}> 
        <Grid item xs={12}>
            <Title>Wiki</Title>
        </Grid>
        <Grid item xs={2}>
            <Box className={classes.box}>
            <Tabs 
                value={selectedTab} 
                onChange={handleChange} 
                aria-label="basic tabs example"
                orientation="vertical"
                indicatorColor="primary"
            >
                {topicsMetadata.map((item, index) => {
                    if (props.discoveredTopics.includes(item.key)){
                        if (readTopics[item.key] !== undefined){
                            return (<StyledTab key={index} label={item.title}/>); 
                        } else {
                            return (<StyledTab key={index} label={"NEW!! " + item.title}/>); 
                        }
                    } else {
                        return <StyledTab  key={index} disabled icon={<LockIcon />}/>; 
                    }
                })}
            </Tabs>   
            </Box>
        </Grid>
        <Grid item xs={10}>     
        {topicsMetadata.map((item, index) => {
            if (selectedTab === index && props.discoveredTopics.includes(item.key)){
                return (<Info className="infotext" key={index} 
                            title={item.title} 
                            descriptions={textDescriptions[item.key]} 
                            graphNode={<BeautifulDiagram 
                                graphDef={graphDefs[item.key]}/>}/>); 
            } else {
                return null; 
            }
        })}
        </Grid>
    </Grid>
    </Paper>
    )
}
