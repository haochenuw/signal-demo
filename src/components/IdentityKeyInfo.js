import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { makeStyles } from '@mui/styles';
import { Typography, Card } from '@mui/material';

import { styled } from '@mui/system';

const MyDiv = styled('Typography')({
  color: '#ff4400',
  backgroundColor: 'aliceblue',
  padding: 8,
  borderRadius: 4,
  display: 'block', 
  textAlign: 'left', 
  fontSize: 34, 
});

export default function IdentityKeyInfo(props){
    // const classes = useStyles();

    return(
        <Card>
        <Typography variant="h2" align="left"> Identity Key</Typography> 
        
        <MyDiv> An identity key is really a public-private key pair. </MyDiv>
        
        <MyDiv> A signal client generates the keypair during registration, and
            sends the public key to the server. 
        </MyDiv> 
            
        <MyDiv> The server store the identity key next to the client's account information. </MyDiv>  

        <MyDiv>     
            The client should secure its identity private key -- anyone holding the identity key can impersonate
            the client. 
        </MyDiv>
        </Card>
    )
}