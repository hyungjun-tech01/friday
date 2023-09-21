 //import {atom} from "recoil";

export interface ILabel{
    labelId : string; 
    labelName: string;
    boardId: string;
    color:string;
}
export const defaultLabel:ILabel = {
    labelId:"", labelName:"", boardId:"", color:""
}