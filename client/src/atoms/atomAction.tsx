export interface IAction {
    actionId: string;
    cardId: string;
    userId: string;
    userName: string;
    type: string;
    data: {text:string};
    createdAt: string;
    updatedAt: string;
}