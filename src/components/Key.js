
import React from "react"
import { uint8ArrayToString } from "../storage-type";
import { tob64Str } from "../util";
import '../styles/styles.css';

const { Generator } = require('contrast-color-generator');
let generator = new Generator(180, {minimumRatio: 4.5});
// show the last 10 chars of string 
export default function Key(props) {

    const selected = props.selected ? "selected" : ""
    const classes = `key ${selected}`
    const display = props.display ?? "block"; 

    if (props.keyArray) {
        let keyBase64Str = tob64Str(props.keyArray)
        let u8rep = new Uint8Array(props.keyArray)
        let colorHex = colorFromU8Array(u8rep.slice(-3))
        const keyStyle = {
            color: colorHex,
            background: generator.generate(colorHex).hexStr, 
            margin: 10, 
            padding: 10, 
            display: display
        }
        return (
            <div className={classes} style={keyStyle} onClick={props.onClick}>
                {props.desc}: {"..." + keyBase64Str.slice(-10)} 
            </div>
        )
    } else {
        return (
            <div>NOTHING</div>
        )
    }
}

function colorFromU8Array(u8Array) {
    if (u8Array.length !== 3) {
        console.log("error: incorrect input length!");
        console.log({string: uint8ArrayToString(u8Array)});
        return "#FFFFFF";
    }
    let st = buf2hex(u8Array);
    return "#" + st;
}

function buf2hex(buffer) {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}

