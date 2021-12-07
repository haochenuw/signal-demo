import React, { useState, useEffect} from "react";
import Info from "./Info"

import { styled } from '@material-ui/core/styles';
import {textDescriptions, graphDefs} from "./consts"
import {
    Tabs, 
    Tab,
    Grid,
} from "@material-ui/core";
import BeautifulDiagram from "./BeautifulDiagram";

const StyledTab = styled(Tab)({
    borderBottom: '1px solid #e8e8e8',
    backgroundColor: '#1890ff',
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
        key: "identityKey", 
        title: "identityKey", 
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

    const handleChange = (_, newValue) => {
        setSelectedTab(newValue);
    };

    return (
    <Grid container direction="row" spacing={10}> 
        <Grid item xs={2}>
        <Tabs 
            value={selectedTab} 
            onChange={handleChange} 
            aria-label="basic tabs example"
            orientation="vertical"
            indicatorColor="primary"
        >
            {topicsMetadata.map((item, index) => {
                if (props.discoveredTopics.includes(item.key)){
                    return (<StyledTab key={index} label={item.title}/>); 
                } else {
                    return <StyledTab  key={index} label="Locked"/>; 
                }
            })}
        </Tabs>   
        </Grid>
        <Grid item xs={10}>     
        {topicsMetadata.map((item, index) => {
            if (selectedTab === index && props.discoveredTopics.includes(item.key)){
                return (<Info key={index} 
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
    )
}
