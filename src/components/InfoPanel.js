import React, { useState, useEffect} from "react";
import Info from "./Info"

import { styled } from '@material-ui/core/styles';
import {textDescriptions, graphDefs} from "./consts"
import {
    Tabs, 
    Tab
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
]

export default function InfoPanel(props) {
    
    const [selectedTab, setSelectedTab] = useState(0); 

    const handleChange = (_, newValue) => {
        setSelectedTab(newValue);
    };

    return (
    <>
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
    {/* {selectedTab === 0 && <Info title="Registration" descriptions={textDescriptions["registration"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 1 && <IdentityKeyInfo/>}
    {selectedTab === 2 && <Info title="PreKey Bundle" descriptions={textDescriptions["prekeyBundle"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 3 && <Info title="Root Key" descriptions={textDescriptions["rootKey"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 4 && <Info title="X3DH" descriptions={textDescriptions["x3dh"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 5 && <Info title="Chain Key" descriptions={textDescriptions["chainKey"]} graphNode={<ChainKeyDiagram/>} />}
    {selectedTab === 6 && <Info title="Message Key" descriptions={textDescriptions["messageKey"]} />}
    {selectedTab === 7 && <Info title="Session" descriptions={textDescriptions["session"]} graphNode={<SessionDiagram/>}/>}
    {selectedTab === 8 && <Info title="Ratchet" descriptions={textDescriptions["ratchet"]} />}
    {selectedTab === 9 && <Info title="Chain" descriptions={textDescriptions["chain"]} />} */}
    </>
    )
}
