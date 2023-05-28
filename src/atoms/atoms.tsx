import {atom} from "recoil";

export interface Project{
    projectId : number;
    projectName : string;
}

// default value 1, MyProject 1
export const myProject = atom<Project[]>({
    key:"myProject",
    default : [
        { projectId:1 , projectName:"MyProject1"}
    ]
});