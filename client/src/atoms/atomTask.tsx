import { atom } from "recoil";

export interface ITask{
    taskId : string;
    taskName : string;
    cardId : string;
    isCompleted: boolean;
    isPersisted: boolean;
};

export const defaultTask : ITask = {
    taskId: "", taskName: "", cardId: "",
    isCompleted: false, isPersisted: false,
};