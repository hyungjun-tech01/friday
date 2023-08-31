export interface IAction {
    id: string;
    cardId: string;
    userId: string;
    userName: string;
    type: string;
    data: {text:string};
    createdAt: string;
    updatedAt: string;
}