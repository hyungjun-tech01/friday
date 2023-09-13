import Paths from "../constants/Paths";
import {ICreateCard, IModifyCard} from "../atoms/atomCard";
const BASE_PATH = Paths.BASE_PATH; 

// 보드에 속한 모든 카드를 가지고 온다..
export const apiGetCards = async (boardId:string) => {
    console.log("getcard", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/cards/${boardId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

};

export const apiGetCardsbyListId = async (listId:string) => {
    console.log("getcardbyList", listId);
    if(listId === null || listId === ''){
        return(null);
    }
    try{
        const response = await fetch(`${BASE_PATH}/cards/${listId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

};

export const apiCreateCard = async (card:ICreateCard) => {
    console.log("createcard", BASE_PATH);
    
    try{
        const response = await fetch(`${BASE_PATH}/card`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(card)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
    }
};
export const apiModifyCard = async (card:IModifyCard) => {
    console.log("modify card", BASE_PATH);
    
    try{
        const response = await fetch(`${BASE_PATH}/modifyCard`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(card)
           }); 
           const responseMessage = await response.json();
           return(responseMessage);
     }catch(err){
        console.error(err);
    }
};


export const apiGetInfosByCardId = async (cardId:string) => {
    console.log("createcard", BASE_PATH);
    
    try{
        const response = await fetch(`${BASE_PATH}/cardbyId/${cardId}`,{
            method: "GET", 
        }); 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }
};