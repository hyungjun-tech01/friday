import { IModifyBoard, IQueryBoard, ICheckBoardEditAuth } from "../atoms/atomsBoard";
import Paths from "../constants/Paths";

const BASE_PATH = Paths.BASE_PATH; 

export const apiGetBoards = async (project:IQueryBoard) => {
    // console.log('api get boards');
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
export const apiGetCurrentBoards = async (checkAuth:ICheckBoardEditAuth) => {
   // console.log("apiGetCurrentBoards", checkAuth.boardId);
    if(checkAuth.boardId === null || checkAuth.boardId === ''){
   //     console.log("apiGetCurrentBoards null?", checkAuth.boardId);
        return(null);
    }
    try{
        const response = await fetch(`${BASE_PATH}/currentBoard`, {
        method: "POST", 
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(checkAuth)});  // backtik 
        
        const json = await response.json()
        return json;
  
    }catch(err){
        console.error(err);
    }
};

export const apiModifyBoard = async(board:IModifyBoard) => {
    try{
        const response = await fetch(`${BASE_PATH}/board`,{
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

export const apiCheckEditBoard = async(checkAuth:ICheckBoardEditAuth) =>{
    try{
        const response = await fetch(`${BASE_PATH}/boardAuth`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(checkAuth)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
    }
}