import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../styles/styles.css"
import {
    faYoutube,
    faFacebook,
    faTwitter,
    faGithub
  } from "@fortawesome/free-brands-svg-icons";
  import styled from 'styled-components'

const SubTitle = styled.h2`
font-size: 4em;
text-align: left;
color: "black";
margin: 20px; 
`;

export default function SocialFollow(props){
    return(
        <>
        <SubTitle>Stay tuned</SubTitle>
        <a href="https://www.youtube.com/c/jamesqquick"
        className="youtube social">
        <FontAwesomeIcon color={"red"} icon={faYoutube} size="2x" />
        </a>
        <a href="https://twitter.com/haochencrypto" className="twitter social">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
        </a>
        <a href="https://github.com/haochenuw" className="github social">
            <FontAwesomeIcon icon={faGithub} size="2x" />
        </a>
        </>
    )
}