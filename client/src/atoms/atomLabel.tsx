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

export interface ICardLabel {
    cardLabelId: string;
    lableId: string;
    cardId: string;
    labelName: string;
    color: string;
    createdAt: string;
    updatedAt: string | null;
}