import { atom, selector } from "recoil";
import { ILabel } from "./atomLabel";
import { ITask } from "./atomTask";
import { IComment } from "./atomAction";
import { IStopwatch } from "./atomStopwatch";

export interface ICard{
    cardId: string; 
    boardId: string;
    listId: string;
    coverAttachmentId: string | null;
    cardName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    position : string | null;
    dueDate : string|null;
    statusId:string | null;
    statusName:string;
    stopwatch : IStopwatch|null;
    labels: ILabel[];
    memberships : ICardUser[];
    attachments : IAttachment[];
    tasks : ITask[];
    comments : IComment[];
}

export interface ICardUser{
    cardMembershipId:string;
    cardId:string;
    userId:string;
    createdAt:string;
    updatedAt:string | null;
    email:string;
    userName:string;
    avatarUrl:string;
}
export interface IAttachment{
    cardAttachementId : string;
    cardId : string;
    creatorUserId : string;
    creatorUserName : string;
    dirName : string;
    fileName : string;
    cardAttachmentName : string;
    createdAt : string;
    updatedAt : string | null;
    image : IImage | null;
    url : string;
    coverUrl : string;
    isCover : boolean;
    isPersisted : boolean;
}

export const defaultCard:ICard = {
    cardId:"" , cardName:"",  coverAttachmentId:"", boardId:"", listId:"",
    description:"",  labels:[], createdAt:"", updatedAt:"" , position:"",
    dueDate:"", statusId:"", statusName:"",
    stopwatch:{total:0,startedAt:null }, memberships:[], attachments:[], 
    tasks:[], comments:[],
}

export interface ICreateCard{
    listId:string;
    userId:string;
    cardName:string;
}


interface IImage {
    width : string;
    height : string;
    thumbnailsExtension: string;
}
export interface IModifyCard{
   cardId : string ;     // number 
    userId : string;       // number 
    cardActionType : 'ADD'|'UPDATE'|'DELETE'|null;    // 나머지는 모두 string 
    listId : string | null;
    boardId : string | null;
    description : string |null ;
    cardName :  string |null ;
    dueDate :  string |null ;
    position : string |null ;
    stopwatch : IStopwatch;
    coverAttachmentId : string|null;
    cardMembershipActionType : 'ADD'|'DELETE'|null; 
    cardMembershipId : string |null ;
    cardMembershipUserId : string |null ;
    cardLabelActionType : 'ADD'|'DELETE'|null; 
    cardLabelId :  string |null ;
    labelId : string |null ;
    cardTaskActionType : 'ADD'|'UPDATE'|'DELETE'|null; 
    cardTaskId : string |null ;
    cardTaskName : string |null ;
    cardTaskIsCompleted : string |null ;
    cardTaskPosition :  string |null ;
    cardAttachmentActionType : 'ADD'|'UPDATE'|'DELETE'|'COVER ADD'|'COVER DELETE'|null; 
    cardAttachmentId : string |null ;
    cardAttachmentDirname : string |null ;
    cardAttachmentFilename : string |null ;
    cardAttachmentName :  string |null ;
    cardAttachmentImage : string|null  ;
    cardCommentActionType :   'ADD'|'UPDATE'|'DELETE'|null; 
    cardCommentId :  string |null ;
    cardCommentText  : string |null ;
    cardStatusActionType : 'UPDATE'|null; 
    cardStatusId : string |null  ;
}

export const defaultModifyCard:IModifyCard = {
    cardId:'0',     // number 
    userId :'0',       // number 
    cardActionType :null,    // 나머지는 모두 string 
    listId: null,
    boardId : null,
    description :null,
    cardName :null, 
    dueDate :null, 
    position :null,
    stopwatch : {total:0,startedAt:null},
    coverAttachmentId: null,
    cardMembershipActionType :null,
    cardMembershipId :null,
    cardMembershipUserId :null,
    cardLabelActionType :null,
    cardLabelId :null, 
    labelId :null,
    cardTaskActionType :null,
    cardTaskId :null,
    cardTaskName :null,
    cardTaskIsCompleted :null,
    cardTaskPosition :null, 
    cardAttachmentActionType :null,
    cardAttachmentId :null,
    cardAttachmentDirname :null,
    cardAttachmentFilename :null,
    cardAttachmentName :null, 
    cardAttachmentImage :null,
    cardCommentActionType :null,  
    cardCommentId :null, 
    cardCommentText  :null,
    cardStatusActionType :null,
    cardStatusId : null,
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
