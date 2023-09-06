export interface IAction {
    actionId: string;
    cardId: string;
    userId: string;
    userName: string;
    type: string;
    data: {text:string};
    createdAt: string;
    updatedAt: string | null;
}

export const defaultAction:IAction = {
    actionId: '', cardId: '', userId: '', userName: '',
    type: '', data: {text:''}, createdAt:'', updatedAt: null,
}