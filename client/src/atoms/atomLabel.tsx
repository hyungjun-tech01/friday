 //import {atom} from "recoil";
import React from "react";
export interface ILabel{
    labelId : string; 
    labelName: string;
    boardId: string;
    color:string;
    position : string;
}
export const defaultLabel:ILabel = {
    labelId:"", labelName:"", boardId:"", color:"", position:"",
}