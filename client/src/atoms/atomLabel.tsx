import {atom} from "recoil";

export interface ILabel{
    labelId : string; 
    labelName: string;
    cardId: string;
    color:string;
}
export const defaultLabel:ILabel = {
    labelId:"", labelName:"", cardId:"", color:""
}