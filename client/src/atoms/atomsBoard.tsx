import {atom} from "recoil";

export interface IBoard{
    boardId : string;
    projectId : string;
    projectName : string;
    boardName : string;
    createdAt : string;
    role : string;
    userId : string;
}

export interface ICurrent{
    boardId : string;
    projectId : string;
}

export interface ICreateBoard{
    projectId : string;
    userId : string;
    boardName : string;
}

export const atomCurrentMyBoard = atom<ICurrent>({
    key : "currentBoard",
    default : { boardId:"" , projectId:""}
});

// default value 1, MyProject 1
export const atomMyBoard = atom<IBoard[]>({
    key:"myBoard",
    default : [
        { boardId:"" , projectId:"", projectName:"", 
          boardName:"", createdAt:"", role:"", userId:""},
    ]
});