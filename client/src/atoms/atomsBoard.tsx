import {atom, selector, RecoilState} from "recoil";
import {ILabel} from "./atomLabel";
import {IList} from "./atomsList";
import {ICard} from "./atomCard";
import { composeInitialProps } from "react-i18next";

export interface IBoard{
    boardId : string;
    projectId : string;
    projectName : string;
    boardName : string;
    createdAt : string;
    role : string;
    userId : string;
}

// default value 1, MyProject 1
export const atomMyBoard = atom<IBoard[]>({
    key: "myBoard",
    default : [
        { boardId:"" , projectId:"", projectName:"", 
          boardName:"", createdAt:"", role:"", userId:""},
    ]
});

export interface IModifyBoard{
    boardActionType:'ADD'|'UPDATE'|'DELETE'|null;
    userId : string;
    projectId:string|null;
    boardName : string|null;
    boardPosition:string|null;
    boardId:string|null;
    boardMembershipActionType: 'ADD'|'UPDATE'|'DELETE'|null;
    boardMembershipId : string|null;
    boardMembershipUserId : string|null;
    boardMembershipRole : 'editor'|'viewer'|null;
    boardMembershipCanComment : 'true'|'false'|null;
    boardLabelActionType : 'ADD'|'DELETE'|'UPDATE'|null;
    labelId :string|null; 
    labelName : string|null; 
    labelColor : string|null; 
    labelPosition : string|null;
}
export const defaultModifyBoard:IModifyBoard = {
    boardActionType:null,
    userId : '0',
    projectId: null,
    boardName : null,
    boardPosition:null,
    boardId:null,
    boardMembershipActionType: null,
    boardMembershipId : null,
    boardMembershipUserId : null,
    boardMembershipRole : null,
    boardMembershipCanComment : null,
    boardLabelActionType : null,
    labelId : null, 
    labelName : null, 
    labelColor : null, 
    labelPosition : null,
}


export interface ICreateBoard{
    projectId : string;
    userId : string;
    boardName : string;
}
export interface IQueryBoard{
    projectId : string;
    userId : string;
}
export interface ICheckBoardEditAuth{
    boardId: string;
    userId: string;
}

// 보드를 찍었을 때 보드 안에 있는 모든 데이터를 가지고 온다. currentBoard 
export interface ICurrent{
    boardId : string;
    canEdit : string;
    users : IBoardUser[];
    labels : ILabel[];
    lists : IList[];
    cards : ICard[];
}

// board_memebership 대응
export interface IBoardUser{
    boardId:string;
    userId:string;
    userName:string;
    role:string;
    avatarUrl:string;
    userEmail:string;
    canEdit:string;
    canComment:string;
}

export const defaultCurrentMyBoard:ICurrent = {
    boardId:"", 
    canEdit:"",
    users:[],
    labels : [],
    lists: [],
    cards:[],

}
export const atomCurrentMyBoard = atom<ICurrent>({
    key : "currentBoard",
    default : defaultCurrentMyBoard
});

// users get , set 

// labels get. set

// lists get, set (추가 , 삭제 ??)
export const listsSelector = selector ({
    key:"listsSelector",
    get:({get}) => {
        const board = get(atomCurrentMyBoard); 
        return (board.lists);
    },
    set:({set, get}, newValue )=>{
        if (Array.isArray(newValue) && newValue.length === 2) {
            const [InListId, newList] = newValue;
            const board = get(atomCurrentMyBoard); 
            const updatedLists = board.lists.concat(newList);
            const newAtomCurrentMyBoard = {...board,  lists: updatedLists,};
            return set(atomCurrentMyBoard, newAtomCurrentMyBoard);    
        }
    }
});

// 특정 listId를 가진 List를 get ,  selector 의 set을 통해 변경
export const listSelector = selector({
    key:"listSelector",
    get:( {get}) => {
        const board = get(atomCurrentMyBoard); 
        return (InListId:string) => {
            return (board.lists.filter((list)=> list.listId === InListId)
                );
        };
    },
    set:({set, get}, newValue )=>{
        if (Array.isArray(newValue) && newValue.length === 2) {
        const [InListId, newList] = newValue;
        const board = get(atomCurrentMyBoard); 
        const updatedLists = board.lists.map((list:any) => {
            if(list.listId === InListId){
                return{...list, ...newList};
            }
            return list;
        })
        const newAtomCurrentMyBoard = {...board,  lists: updatedLists,};

        return set(atomCurrentMyBoard, newAtomCurrentMyBoard);
    }
    }
});


// 특정 listId  가진 Cards 를 selecting 
export const cardsbyListIdSelector = selector({
    key:"cardsbyListIdSelector",
    get:( {get}) => {
        const board = get(atomCurrentMyBoard); 
        return (InListId:string) => {
            return (board.cards.filter((card)=> card.listId === InListId)
                );
        };
    },
});


// 특정 cardId를  가진 Card를 selecting 하고 set을 통해서 변경 
export const cardSelectorCardId = selector({
    key:"cardSelectorCardId",
    get:( {get}) => {
        const board = get(atomCurrentMyBoard); 
        return (InCardId:string) => {
            return (board.cards.filter((card)=> card.cardId === InCardId)
                );
        };
    },
    set:({set, get}, newValue )=>{
        if (Array.isArray(newValue) && newValue.length === 2) {
        const [InCardId, newCard] = newValue;
        const board = get(atomCurrentMyBoard); 
        const updatedCards = board.cards.map((card:any) => {
            if(card.cardId === InCardId){
                return{...card, ...newCard};
            }
            return card;
        })
        const newAtomCurrentMyBoard = {...board,  cards: updatedCards,};

        return set(atomCurrentMyBoard, newAtomCurrentMyBoard);
    }
    }
});

// 추후 삭제 필요 
export interface IBoardMember{
    boardId : string;
    canEdit : string; 
    users : IBoardUser[];
    boardmMemberAllUsers : IBoardUser[];
}

