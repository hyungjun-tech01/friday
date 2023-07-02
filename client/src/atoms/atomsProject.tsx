import {atom} from "recoil";

export interface IProject{
    projectId : string;
    projectName : string;
}

export interface INewProject{
    projectId : string;
    projectName : string;
    userId : string;
    date : Date;
}


// default value 1, MyProject 1
export const atomMyProject = atom<IProject[]>({
    key:"myProject",
    default : [
        { projectId:"" , projectName:""},
    ]
});

export const atomCurrentProject = atom<IProject[]>({
    key:"currentProject",
    default : [
        { projectId:"" , projectName:""},
    ]
});