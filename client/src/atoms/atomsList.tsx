import {atom} from "recoil";

export interface IList{
    listId : string; 
    boardId: string;
    listName: string;
    position: string;
    createdAt:string;
    updatedAt:string;
}

// myLists 
export const atomMyList = atom<IList[]>({
    key:"myBoardLists",
    default : [
        { listId:"" , boardId:"", listName:"", 
        position:"", createdAt:"", updatedAt:""},
    ]
});

/*
select id as "listId", board_id as "boardId", name as "listName", 
position as "position", created_at as "createdAt", 
updated_at as "updatedAt" from list
*/