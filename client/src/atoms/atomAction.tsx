import React from "react";
export interface IAction {
    actionId: string;
    cardId: string;
    userId: string;
    userName: string;
    type: string;
    data: object;
    createdAt: string;
    updatedAt: string | null;
};

export const defaultAction:IAction = {
    actionId: '', cardId: '', userId: '', userName: '',
    type: '', data: {}, createdAt:'', updatedAt: null,
};

export interface IComment {
    commentId: string;
    cardId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
    updatedAt: string | null;
    avatarUrl: string | null;
};

export const defaultComment:IComment = {
    commentId: '', cardId: '', userId: '', userName: '',
    text: '', createdAt:'', updatedAt: null, avatarUrl: null,
}