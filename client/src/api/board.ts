import { ICreateBoard, IQueryBoard } from "../atoms/atomsBoard";
import Paths from "../constants/Paths";

const BASE_PATH = Paths.BASE_PATH; 

export const apiGetBoards = async (project:IQueryBoard) => {
    console.log("getboard", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/boards`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(project)
           }); 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};
export const apiCreateBoard = async(board:ICreateBoard) => {
    console.log('create Board api');
    try{
        const response = await fetch('http://localhost:7000/board',{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(board)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
    }
}