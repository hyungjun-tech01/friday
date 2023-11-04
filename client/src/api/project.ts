import {IModifyProject} from "../atoms/atomsProject";
import Paths from "../constants/Paths";


const BASE_PATH = Paths.BASE_PATH; 

export const apiGetProjects = async (userId:string) => {
    try{
        const response = await fetch(`${BASE_PATH}/projects/${userId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};

export const apiGetProjectbyId = async (projectId:string) => {
    console.log("getprojectby project id", BASE_PATH, projectId);
    if(projectId === undefined){
        return {message:'err'};
    }
    try{

        const response = await fetch(`${BASE_PATH}/project/${projectId}`);  // backtik 
        const json = await response.json()
        console.log('getprojectby json',json);
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};


export async function  apiPostProjects(project:IModifyProject) {
    console.log("post project", project);
    try{
        const response = await fetch(`${BASE_PATH}/project`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(project)
           }); 

           const json = await response.json()
           return json;
    }catch(err){
        console.error(err);
        return(err);
    }
 }

