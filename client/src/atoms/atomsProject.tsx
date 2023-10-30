import {atom} from "recoil";
import {selector} from "recoil";
import React from "react";

export interface IProject{
    projectId : string;
    projectName : string;
    defaultBoardId : string;
}

export interface INewProject{
    projectId : string;
    projectName : string;
    userId : string;
    date : Date;
}


// default value 1, MyProject 1
export const atomMyProject = atom<IProject[]>({
    key:"atomMyProject",
    default : [
        { projectId:"" , projectName:"", defaultBoardId:""},
    ]
});

// 특정 projectId를 가진 project를 selecting 
export const projectSelector = selector({
    key:"projectSelector",
    get:( {get}) => {
        const project = get(atomMyProject); 
        return (InProjectId:string) => {
            return (project.filter((project)=> project.projectId === InProjectId)
                );
        };
    },
});


export const atomCurrentProject = atom<IProject[]>({
    key:"currentProject",
    default : 
        [{ projectId:"" , projectName:"", defaultBoardId:""}],
});

export const atomCurrentProjectId = atom<string>({
    key:"currentId",
    default : 
        "0", 
});

export const getCurrentProject = selector({
    key: 'getCurrentProject',
    get: ({ get }) => {
        return get(atomCurrentProjectId);
    },
});