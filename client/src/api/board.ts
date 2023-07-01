import { atomMyBoard } from "../atoms/atomsBoard";
import Paths from "../constants/Paths";

const BASE_PATH = Paths.BASE_PATH; 

export const apiGetBoards = async (projectId:string) => {
    console.log("getboard", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/boards/${projectId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};
