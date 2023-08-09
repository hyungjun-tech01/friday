import Paths from "../constants/Paths";

const BASE_PATH = Paths.BASE_PATH; 

export const apiGetCards = async (boardId:string) => {
    console.log("getcard", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/cards/${boardId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};

export const apiGetCardsbyListId = async (listId:string) => {
    console.log("getcardbyList", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/cards/${listId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};