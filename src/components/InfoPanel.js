import React, { useState } from "react";
import RegistrationInfo from "./RegistrationInfo";
import RootKeyInfo from "./RootKeyInfo";
import Info from "./Info"

import { styled } from '@material-ui/core/styles';
import {textDescriptions} from "./consts"
import X3DHFlow from "./X3DHFlow.js"
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

const numberOfPanels = 3; 

export default function InfoPanel(props) {
    
    const [selectedTab, setSelectedTab] = useState(0); 
    const [disabledArray, setDisabledArray] = useState(Array(numberOfPanels).fill(true)); 

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
        <StyledTab label="Registration" disabled={disabledArray[0]}/>
        <StyledTab label="Identity Key"/>
        <StyledTab label="Prekey Bundle"/>
        <StyledTab label="Root Key"/>
        <StyledTab label="X3DH"/>
        <StyledTab label="Chain Key"/>
    </Tabs>
    <div display="block">
    {selectedTab === 0 && <RegistrationInfo/>}
    {selectedTab === 1 && <IdentityKeyInfo/>}
    {selectedTab === 2 && <RegistrationInfo/>}
    {selectedTab === 3 && <RootKeyInfo/>}
    {selectedTab === 4 && <Info title="X3DH" descriptions={["asdf"]}/>}
    {selectedTab === 5 && <Info title="Chain Key" descriptions={textDescriptions["chainKey"]} graphNode={<X3DHFlow/>}/>}
    {selectedTab === 6 && <Info title="Message Key" descriptions={textDescriptions["messageKey"]} />}
    </div>
    </>
    )
}
