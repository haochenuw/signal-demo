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
        "margin-top": '20px'
    },

    tab: {
        borderBottom: '1px solid #e8e8e8',
        backgroundColor: '#1890ff',
        borderRadius: "5px"
    }, 

});


export default function InfoPanel(props) {
    
    const [selectedTab, setSelectedTab] = useState(0); 

    const [readTopics, setReadTopics] = useState({}); 

    const handleChange = (_, newValue) => {
        setSelectedTab(newValue);
    };

    const classes = useStyles(); 

    return (
    <Paper>
    <Grid container justifyContent="center" direction="row" spacing={10}> 
        <Grid item xs={2}>
            <Box className={classes.box}>
            <Tabs 
                value={selectedTab} 
                onChange={handleChange} 
                aria-label="basic tabs example"
                orientation="vertical"
                indicatorColor="primary"
            >
                {Object.keys(textDescriptions).map((key, index) => {
                    if (props.discoveredTopics.includes(key)){
                        const value = textDescriptions[key]; 
                        if (readTopics[key] !== undefined){
                            return (<StyledTab key={index} label={value.title}/>); 
                        } else {
                            return (<StyledTab key={index} label={value.title}/>); 
                        }
                    } else {
                        return <StyledTab  key={index} disabled icon={<LockIcon />}/>; 
                    }
                })}
            </Tabs>   
            </Box>
        </Grid>
        <Grid item xs={10}>    
        <Box className={classes.box}>
        {Object.keys(textDescriptions).map((key, index) => {
            const value = textDescriptions[key]; 
            if (selectedTab === index && props.discoveredTopics.includes(key)){
                return (<Info className="infotext" key={index} 
                            title={value.title} 
                            descriptions={value.content} 
                            graphNode={<BeautifulDiagram 
                                graphDef={graphDefs[key]}/>}/>); 
            } else {
                return null; 
            }
        })}
        </Box>
        </Grid>
    </Grid>
    </Paper>
    )
}
