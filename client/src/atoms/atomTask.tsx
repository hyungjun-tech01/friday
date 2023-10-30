import { atom, selector } from "recoil";
import React from "react";

export interface ITask{
    taskId : string;
    taskName : string;
    cardId : string;
    isCompleted: boolean;
    // isPersisted: boolean; <-- planka에서는 'localID'가 아닌 경우에 true로 설정
};

export const defaultTask : ITask = {
    taskId: "", taskName: "", cardId: "",
    isCompleted: false //, isPersisted: false,
};

// currentTasks : card 선택으로 CardModal에서 불려진 Task들
export const atomCurrentTasks = atom<ITask[]>({
    key:"currentTasks",
    default: [],
});

// 특정 listId를 가진 card만을 selecting 
export const taskSelector = selector({
    key:"SelectedTask",
    get:({get}) => {
        return (taskId:string) => {
            const tasks = get(atomCurrentTasks); 
            return tasks.filter((task:ITask)=> task.taskId === taskId);
        };
    },
});