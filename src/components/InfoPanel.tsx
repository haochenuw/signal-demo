import React, { useState, useEffect} from "react";
import Info from "./Info"
import PubSub from 'pubsub-js'

import { styled } from '@material-ui/core/styles';
import {textDescriptions} from "./consts"
import X3DHFlow from "./X3DHFlow.js"
import ChainKeyDiagram from "./ChainKeyDiagram";
import SessionDiagram from "./SessionDiagram";
// material UI imports 
import {
    Tabs, 
    Tab
} from "@material-ui/core";

const StyledTab = styled(Tab)({
    borderBottom: '1px solid #e8e8e8',
    backgroundColor: '#1890ff',
});

interface Topic {
    key: string;
    title: string;
}

const topicsMetadata: Topic[] = [
    {
        key: "", 
        title: "Registration", 
    }, 
    {
        key: "identityKey", 
        title: "identityKey", 
    }
]

export default function InfoPanel(props: any) {
    
    const [selectedTab, setSelectedTab] = useState(0); 

    const [discoveredTopics, setDiscoveredTopics] = useState<String[]>([]); 

    const handleChange = (_: any, newValue: number) => {
        setSelectedTab(newValue);
    };

    
    useEffect(()=>{
        const topicDiscoverHandler = (key: any, topic: String) => {
            console.log('discover!', topic); 
            setDiscoveredTopics(discoveredTopics => [...discoveredTopics, topic]);
            console.log('updated topic list', JSON.stringify(discoveredTopics));
        }
        var subscription = PubSub.subscribe('discoverTopic', topicDiscoverHandler);
    }, []);

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
            if (discoveredTopics.includes(item.key)){
                console.log('got here')
                return (<StyledTab key={index} label="Registration"/>); 
            } else {
                console.log('got there')
                return <StyledTab  key={index} label="Locked"/>; 
            }
        })}
        {/* <StyledTab label="Registration"/>
        <StyledTab label="Identity Key"/>
        <StyledTab label="Prekey Bundle"/>
        <StyledTab label="Root Key"/>
        <StyledTab label="X3DH"/>
        <StyledTab label="Chain Key"/>
        <StyledTab label="Message Key"/>
        <StyledTab label="Session"/>
        <StyledTab label="Ratchet"/>
        <StyledTab label="Chain"/> */}
    </Tabs>        
    {topicsMetadata.map((item, index) => {
        if (selectedTab === index && discoveredTopics[item["key"]]){
            return (<Info title={item["title"]} descriptions={textDescriptions[item["key"]]}/>); 
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
