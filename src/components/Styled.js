
import { withStyles } from "@material-ui/core/styles";
import {Button, Typography} from "@material-ui/core"; 
import styled from 'styled-components'

export const Title = styled.h1`
font-size: 3em;
text-align: center;
color: #252525;
`;

export const SubTitle = styled.h2`
font-size: 2em;
text-align: left;
color: #bcbcbc;
&:hover {
    cursor: pointer; 
}
`;


export const H3Title = styled.h3`
font-size: 1.5em;
text-align: left;
color: #bcbcbc;
&:hover {
    cursor: pointer; 
}
`;

export const StyledButton = withStyles({
    root: {
      color: "white",
      fontSize: "18px", 
      background: "#4CA873",
      margin: "5px",
      padding: "10px", 
      height: "40px", 
      "&:hover": {
          background: "#2D6445",
      }, 
   }, 
   label: {
      textTransform: "capitalize"
   }
  })(Button); 


export const StyledAppBarButton = withStyles({
    root: {
      color: "white",
      fontSize: "20px", 
      margin: "10px", 
   }, 
   label: {
      textTransform: "capitalize"
   }
})(Button); 