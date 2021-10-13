
import React from "react"
import { tob64Str } from "../util";
const { Generator } = require('contrast-color-generator');
let generator = new Generator(180, {minimumRatio: 4.5});

export default function Key(props) {
    if (props.keyArray) {
        let keyBase64Str = tob64Str(props.keyArray)
        let u8rep = new Uint8Array(props.keyArray)
        let colorHex = colorFromU8Array(u8rep.slice(-3))
        const keyStyle = {
            color: colorHex,
            background: generator.generate(colorHex).hexStr
        }
        return (
            <div className="key" style={keyStyle}>
                {props.desc}: {keyBase64Str}
            </div>
        )
    } else {
        return (
            <div>NOTHING</div>
        )
    }
}

function colorFromU8Array(u8Array) {
    if (u8Array.length != 3) {
        console.log("error: incorrect input length!");
        return "black";
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

