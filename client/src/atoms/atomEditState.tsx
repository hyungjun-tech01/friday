import { atom } from "recoil";

export interface IEditElement {
    id : string;
    name: string;
    properties: any;
};

export const defualtEditElement:IEditElement = {
    id: "", name: "", properties: null,
};

export const atomCurrentEditElment = atom<IEditElement>({
    key: "currentEditElement",
    default: defualtEditElement,
});