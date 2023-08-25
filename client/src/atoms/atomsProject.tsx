import {atom} from "recoil";
import {selector} from "recoil";

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
    default : 
        [{ projectId:"" , projectName:""}],
});

export const atomCurrentProjectId = atom<string>({
    key:"currentId",
    default : 
        "11111", 
});

export const getCurrentProject = selector({
    key: 'getCurrentProject',
    get: ({ get }) => {
        return get(atomCurrentProjectId);
    },
});