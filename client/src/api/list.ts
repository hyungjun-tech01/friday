import Paths from "../constants/Paths";
import {ICreateList, IModifyList} from "../atoms/atomsList";

const BASE_PATH = Paths.BASE_PATH; 

export const apiGetLists = async (boardId:string) => {
    try{
        const response = await fetch(`${BASE_PATH}/lists/${boardId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};

export const apiCreateList = async (list:ICreateList) => {
    console.log("createlist", BASE_PATH);
    
    try{
        const response = await fetch(`${BASE_PATH}/list`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(list)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
    }
};

export const apiModifyList = async (list:IModifyList) => {
    console.log("createlist", BASE_PATH);
    
    try{
        const response = await fetch(`${BASE_PATH}/list`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(list)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
    }
};