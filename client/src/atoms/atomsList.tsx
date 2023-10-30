import {atom} from "recoil";
import React from "react";

export interface IList{
    listId : string; 
    boardId: string;
    listName: string;
    position: string;
    createdAt:string;
    updatedAt:string;
}

export interface ICreateList{
    boardId : string;
    userId : string;
    listName : string;
}

// myLists 
export const atomMyList = atom<IList[]>({
    key:"myBoardLists",
    default : [
        { listId:"" , boardId:"", listName:"", 
        position:"", createdAt:"", updatedAt:""},
    ]
});


export interface IModifyList{
    listActionType:'ADD'|'UPDATE'|'DELETE'|null;
    userId : string;
    position:string|null;
    boardId:string|null;
    listName:string|null;
    listId:string|null;
}
export const defaultModifyList:IModifyList = {
    listActionType:null, 
    userId : '0',
    position:null,
    boardId:null,
    listName:null,
    listId:null,
}
