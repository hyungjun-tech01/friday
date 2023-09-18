import {atom} from "recoil";

export interface ILabel{
    labelId : string; 
    labelName: string;
    boardId: string;
    color:string;
}
export const defaultLabel:ILabel = {
    labelId:"", labelName:"", boardId:"", color:""
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