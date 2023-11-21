import React from "react";
import { atom } from "recoil";

export interface INotification {
    notiId: string,
    card: {id:string, name:string},
    user: {name: string, avatarUrl:string},
    activity: {type: string, data: any},
}

export const atomMyNotification = atom<INotification[]>({
    key:"myNotifications",
    default: []
});