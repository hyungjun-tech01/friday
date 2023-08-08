import {atom} from "recoil";

export interface ITask{
    taskId : string;
    taskName : string;
    cardId : string;
}

export const defaultTask : ITask = {
    taskId:"", taskName:"", cardId:""
}