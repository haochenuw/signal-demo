import React, { useState } from "react";
import RegistrationInfo from "./RegistrationInfo";
import RootKeyInfo from "./RootKeyInfo";
import Info from "./Info"

import { styled } from '@material-ui/core/styles';
import {textDescriptions} from "./consts"
import X3DHFlow from "./X3DHFlow.js"
import ChainKeyDiagram from "./ChainKeyDiagram";
// material UI imports 
import {
    Paper,
    Button,
    Chip,
    TextField,
    Tabs, 
    Tab
} from "@material-ui/core";
import IdentityKeyInfo from "./IdentityKeyInfo";

const StyledTab = styled(Tab)({
    borderBottom: '1px solid #e8e8e8',
    backgroundColor: '#1890ff',
});


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
        <StyledTab label="Registration"/>
        <StyledTab label="Identity Key"/>
        <StyledTab label="Prekey Bundle"/>
        <StyledTab label="Root Key"/>
        <StyledTab label="X3DH"/>
        <StyledTab label="Chain Key"/>
        <StyledTab label="Message Key"/>
        <StyledTab label="Session"/>
        <StyledTab label="Ratchet"/>
        <StyledTab label="Chain"/>
    </Tabs>
    <div display="block">
    {selectedTab === 0 && <RegistrationInfo/>}
    {selectedTab === 1 && <IdentityKeyInfo/>}
    {selectedTab === 2 && <RegistrationInfo/>}
    {selectedTab === 3 && <RootKeyInfo/>}
    {selectedTab === 4 && <Info title="X3DH" descriptions={["asdf"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 5 && <Info title="Chain Key" descriptions={textDescriptions["chainKey"]} graphNode={<ChainKeyDiagram/>} />}
    {selectedTab === 6 && <Info title="Message Key" descriptions={textDescriptions["messageKey"]} />}
    {selectedTab === 7 && <Info title="Session" descriptions={textDescriptions["session"]} />}
    {selectedTab === 8 && <Info title="Ratchet" descriptions={textDescriptions["ratchet"]} />}
    </div>
    </>
    )
}
