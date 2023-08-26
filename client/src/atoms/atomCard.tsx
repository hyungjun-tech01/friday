import {atom, selector} from "recoil";
import {IUser, defaultUser} from "./atomsUser";
import {ITask, defaultTask} from "./atomTask";
import {ILabel, defaultLabel} from "./atomLabel";

export interface ICard{
    cardId : string; 
    boardId:string;
    listId:string;
    coverUrl:string;
    cardName: string;
    description:string;
    createdAt : string;
    updatedAt : string;
    labels: ILabel[];
}

export const defaultCard:ICard = {
    cardId:"" , cardName:"",  coverUrl:"", boardId:"", 
    listId:"",  description:"",  labels:[], createdAt:"", updatedAt:"" ,
}

export interface ICreateCard{
    listId:string;
    userId:string;
    cardName:string;
}

// allMmyCards  : 보드에 포함된 리스트에 포함된 모든 카드 
export const atomMyCards = atom<ICard[]>({
    key:"allMyCards",
    default : [
        defaultCard,
    ]
});

// currentCard : List에서 선택(click)한 카드
export const atomCurrentCard = atom<ICard>({
    key:"currentCard",
    default: defaultCard,
});

// 특정 listId를 가진 card만을 selecting 
export const cardSelector = selector({
    key:"SelectedCards",
    get:({get}) => {
        return (InlistId:string) => {
            const cards = get(atomMyCards); 
            return cards.filter((card)=> card.listId === InlistId);
        };
    },
});