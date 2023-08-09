import {atom, selector} from "recoil";
import {IUser, defaultUser} from "./atomsUser";
import {ITask, defaultTask} from "./atomTask";
import {ILabel, defaultLabel} from "./atomLabel";

export interface ICard{
    cardId : string; 
    cardName: string;
    dueDate: string;
    stopwatch: string;
    coverUrl:string;
    boardId:string;
    listId:string;
    projectId:string;
    description:string;
    users: IUser[];
    labels: ILabel[];
    tasks: ITask[];
}

export const defaultCard:ICard = {
    cardId:"" , cardName:"", dueDate:"", stopwatch:"",  coverUrl:"", boardId:"", 
    listId:"", projectId:"", description:"", users:[], labels:[],tasks:[]
}

// allMmyCards  : 보드에 포함된 리스트에 포함된 모든 카드 
export const atomMyCards = atom<ICard[]>({
    key:"allMyCards",
    default : [
        { cardId:"" , cardName:"", dueDate:"", 
        stopwatch:"", coverUrl:"", boardId:"",
        listId:"", projectId:"", description:"",
        users:[{...defaultUser}],
        labels:[{...defaultLabel}], tasks:[{...defaultTask}]
    },
    ]
});

// 특정 listId를 가진 card만을 selecting 
export const cardSelector = selector({
    key:"SelectedCards",
    get:( {get}) => {
        return (InlistId:string) => {
            const cards = get(atomMyCards); 
            return cards.filter((card)=> card.listId === InlistId);
        };
    },
});