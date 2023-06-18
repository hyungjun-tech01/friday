import {INewProject} from "../atoms/atoms";
import {Axios} from "axios";

const BASE_PATH = "http://localhost:7000"; 

export const apiGetProjects = async () => {
    console.log("getprojects", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/projects`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};

export async function  apiPostProjects(project:INewProject):Promise<INewProject> {
    console.log("post project", project);
    try{
   /*     const response = await fetch('http://localhost:8000/project',{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(project)
           });  */
           console.log('success');
    }catch(err){
        console.error(err);
    }
    return project;
}