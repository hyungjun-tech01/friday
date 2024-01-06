import {atom} from "recoil";
import {selector, selectorFamily} from "recoil";
import React from "react";
import {IBoardUser} from "./atomsBoard";

export interface IProject {
    projectId : string;
    projectName : string;
    isAdmin : boolean;
    role : string;
    defaultBoardId : string;
    members:IBoardUser[];
    userPools:IBoardUser[];
}

export interface IProjectMember{
    userId:string;
    name:string;
    avatar : string;
    userEmail: string;
}

export interface INewProject {
    projectId : string;
    projectName : string;
    userId : string;
    date : Date;
}

export interface IModifyProject{
    creatorUserId : string;
    projectActionType : 'ADD'|'UPDATE'|'DELETE'|'ADD MANAGER'|'DELETE MANAGER'|'';
    projectName : string|null;
    projectId: string|null ;
    managerId : string|null;
    role :'editor' | 'viewer'|  'manager' | 'normal' | null;
}
export const defaultModifyProject:IModifyProject={
    creatorUserId:"",
    projectActionType:"",
    projectName:null,
    projectId:null,
    managerId:null,
    role:null,
}

// default value 1, MyProject 1
export const atomMyProject = atom<IProject[]>({
    key:"atomMyProject",
    default : []
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
    set: ({set, get}, newValue)=>{
        if (Array.isArray(newValue) && newValue.length === 1) {
            const [updatedProject] = newValue;
            const projects_ = get(atomMyProject);
            const updatedProjects = projects_.map((project) => {
            if(project.projectId === updatedProject.projectId) {
                return{...project, ...updatedProject};
             }
            return project;
        })
        const newAtomCurrentMyProject = {...projects_,   ...updatedProjects};
        return set(atomMyProject, newAtomCurrentMyProject);
    }
    }
});


// 특정 projectId를 가진 project를 Setting
export const projectSetter = selector({
    key:"projectSetter",
    get:( {get}) => {
        return get(atomMyProject); 
    },
    set: ({set, get}, newValue)=>{
        if (Array.isArray(newValue) && newValue.length === 1) {
            const [updatedProject] = newValue;
            const projects_ = get(atomMyProject);
            const updatedProjects = projects_.map((project) => {
            if(project.projectId === updatedProject.projectId) {
                return{...project, ...updatedProject};
             }
            return project;
        })
        return set(atomMyProject, updatedProjects);
    }
    }
});

export const atomCurrentProject = atom<IProject>({
    key:"atomCurrentProject",
    default : 
        { projectId:"" , projectName:"", isAdmin:false, role:"", defaultBoardId:"",members:[], userPools:[] },
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

// Project Seletor 프로젝트 Name 변경 
export const getCurrentProjectSelector = selector({
    key: 'getCurrentProjectSelector',
    get: ({ get }) => {
        return get(atomCurrentProject);
    },
    set: ({set, get}, newValue)=>{
        if (Array.isArray(newValue) && newValue.length === 1) {
            const [updatedProject] = newValue;
        const project = get(atomCurrentProject);
        const newProject = {...project, ...updatedProject};
        return set(atomCurrentProject, newProject);
        } 
    }
});


// Project userPool 변경 
export const projectUsersPoolSelector = selector({
    key:"projectUsersPoolSelector",
    get: ({ get }) => {
        const projects = get(atomCurrentProject);
        return projects.userPools; 
    },
    set: ({set, get}, newValue)=>{
        if (Array.isArray(newValue) && newValue.length === 1) {
            const [newUserPool] = newValue;
        const projects = get(atomCurrentProject);
        const updatedUserPool = projects.userPools.map((userPool:any) => {
            if(userPool.userId === newUserPool.userId) {
                return{...userPool, ...newUserPool};
             }
            return userPool;
        })
        const newAtomCurrentMyProject = {...projects,   userPools:updatedUserPool,};
        return set(atomCurrentProject, newAtomCurrentMyProject);
    }
    }
});


// project members 추가 
export const projectUsersSelector = selector({
    key:"projectUsersSelector",
    get: ({ get }) => {
        const projects = get(atomCurrentProject);
        return projects.members; 
    },
    set: ({set, get}, newValue)=>{
        const projects = get(atomCurrentProject);
        if (Array.isArray(newValue)) {
            const updatedUsers = [...newValue];
            const updatedMembers = projects.members.concat(updatedUsers);
            const newAtomCurrentMyProject = {...projects,   members:updatedMembers,};
            return set(atomCurrentProject, newAtomCurrentMyProject);
        }
    }
});

// project members 추가 
export const projectUsersUpdator = selector({
    key:"projectUsersUpdator",
    get: ({ get }) => {
        const projects = get(atomCurrentProject);
        return projects.members; 
    },
    set: ({set, get}, newValue)=>{
        const projects = get(atomCurrentProject);
        if (Array.isArray(newValue) && newValue.length === 1) {
            const updatedUsers = [...newValue];

            const updatedMembers = projects.members.map((member) => {
                if(member.userId === updatedUsers[0].userId) {
                    return{...member, ...updatedUsers[0]};
                 }
                return member;
            })

            // const updatedMembers = projects.members.concat(updatedUsers);
            const newAtomCurrentMyProject = {...projects,   members:updatedMembers,};
            return set(atomCurrentProject, newAtomCurrentMyProject);
        }
    }
});

// project members 삭제
export const projectUsersDeleter = selectorFamily({
    key:"projectUsersDeleter",
    get: (userId) => ({ get }) => {
        const project = get(atomCurrentProject);
        return project.members.filter((user: any) => user.userId === userId)[0];
    },
    set: (userId:string) => ({set, get}, newValue)=>{
        const projects = get(atomCurrentProject);
        const deleteMember = projects.members.filter( (user:any) => user.userId !== userId);

        const newAtomCurrentMyProject = {...projects,   members:deleteMember,};
        return set(atomCurrentProject, newAtomCurrentMyProject);
    }
});


export interface IBoardToLists {
    id : string,
    name : string,
    lists : {id: string, name: string}[],
    isFetching: boolean | null,
};

export interface IProjectToBoards {
    id : string;
    name : string;
    boards: IBoardToLists[],
};

export const atomProjectsToLists = atom<IProjectToBoards[]>({
    key:'projectsToLists',
    default : [],
});