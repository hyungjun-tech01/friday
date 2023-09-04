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

    //return fetch(`${BASE_PATH}/projects`).then(
    //    (response) => response.json()
    //);
};

export const apiGetCardsbyListId = async (listId:string) => {
    console.log("getcardbyList", listId);
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

 ///// api 호출 sample code 
 //import {ICard, defaultCard} from "../atoms/atomCard";
 //import {IModifyCard, defaultModifyCard} from "../atoms/atomCard";
 //import {apiModifyCard} from "../api/card";
 // cardId, userId는 반드시 들어가야 함. 
 // 필요에 따라 Actiontype 과 값들을 적절하게 세팅하여 호출 : 아래는 descriptipon 변경 방법
//  const cardModifySample = async() => {
//     const card : IModifyCard = {...defaultModifyCard, 
//       cardId:'1057243275443832054', 
//       userId:'967860418955445249',
//       cardTaskActionType:'ADD',
//       cardTaskName:'테스트입니다2',
//       cardTaskPosition:"1000",
//     };
//     console.log(card);
//     const response = await apiModifyCard(card);
//     console.log('moddify response', response);
//   }    
 ///// sample code 

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
