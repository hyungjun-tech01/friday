import Paths from "../constants/Paths";
import { IModifyCard, defaultModifyCard} from "../atoms/atomCard";
const BASE_PATH = Paths.BASE_PATH; 

// 보드에 속한 모든 카드를 가지고 온다..
export const apiGetCards = async (boardId:string) => {
    console.log("getcard", BASE_PATH);
    try{
        const response = await fetch(`${BASE_PATH}/cards/${boardId}`);  // backtik 
        const json = await response.json();
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
        const response = await fetch(`${BASE_PATH}/cardbylistId/${listId}`);  // backtik 
        const json = await response.json();
        return json;
    }catch(err){
        console.error(err);
    }

};

export const apiCreateCard = async (card:IModifyCard) => {
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


export const getProjectIdBoardIdbyCardId = async (cardId:string) => {
    console.log("getProjectIdBoardIdbyCardId", cardId);
    if(cardId === null || cardId === ''){
        return(null);
    }
    try{
        const response = await fetch(`${BASE_PATH}/getProjectIdBoardIdbyCardId/${cardId}`, {
            method: "GET", 
        }); 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
    }

};

export const apiUploadAttatchment = async (data:FormData) => {
    console.log("modify card", data);
    let userId:string  = "";
    let fileName:string = "";
    let cardId:string = "";
    let fileExt:string = "";
    let width:number = 0;
    let height:number = 0;

    for (const [key, value] of data.entries()) {
        if (key === "cardId"  && typeof value === 'string'){
            cardId = value;
        }
        if (key === "userId"  && typeof value === 'string'){
            userId = value;
        }
        if(key === 'fileName'  && typeof value === 'string'){
            fileName = value;
        }
        if(key === 'fileExt'  && typeof value === 'string'){
            fileExt = value;
        }
        if(key === 'width'  && typeof value === 'string'){
            width = parseInt(value,10);
        }
        if(key === 'height'  && typeof value === 'string'){
            height = parseInt( value, 10);
        }
        console.log(key, ":", value);
    }
    try{
        const cardAttachmentImage = {width:width, height:height, thumbnailsExtension: fileExt};
        const response = await fetch(`${BASE_PATH}/upload`,{
            method: "POST", 
            //headers:{'Content-Type':'application/json'},
            body:data
        });
        const responseMessage = await response.json();
        if(responseMessage)
            if(responseMessage.status === 500){
                return ({message:'파일 업로드 중 오류가 발생했습니다.'});
            } else {
                // 성공시DB 처리 
                const card:IModifyCard = {
                    ...defaultModifyCard, 
                    userId : userId,
                    cardAttachmentDirname : responseMessage.dirName, 
                    cardAttachmentFilename : responseMessage.fileName,
                    cardAttachmentName : fileName,
                    cardAttachmentImage : cardAttachmentImage,
                    cardId:cardId, cardAttachmentActionType:'ADD'
                };

                console.log('api attachment', card);                             
                const result = await apiModifyCard(card);
                return({
                    fileName:responseMessage.fileName,
                    dirName :responseMessage.dirName,
                    outAttachmentId:result.outAttachmentId,
                    outAttachmentCreatedAt:result.outAttachmentCreatedAt,
                    outAttachmentUpdatedAt:result.outAttachmentUpdatedAt,
                    outAttachmentUrl:result.outAttachmentUrl,
                    outAttachmentCoverUrl: result.outAttachmentCoverUrl
                })
              }
            else
                return ({message:'파일 업로드 중 오류가 발생했습니다.'});
     }catch(err){
        console.error(err);
        return ({message:'파일 업로드 중 오류가 발생했습니다.'});
    }
};

export const apiDeleteAttatchment = async (data:any) => {
    console.log("delete attachment", BASE_PATH, data);
    const deleteFie = {
        cardAttachmentId: data.cardAttachmentId,
        userId: data.userId,
        cardId: data.cardId,
        fileExt: data.fileExt,
        fileName: data.fileName,
        dirName: data.dirName,
    };
    try{
        const response = await fetch(`${BASE_PATH}/deleteFile`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(deleteFie),
        }); 
        const responseMessage = await response.json();
        if(responseMessage)
              if(responseMessage.status === 500){
                return ({message:'ㅂㅂㅂ파일 삭제 중 오류가 발생했습니다.'});
              }else{
                 // 성공시DB 처리 
                 const card:IModifyCard = {...defaultModifyCard, 
                    userId:deleteFie.userId, 
                    cardAttachmentId:deleteFie.cardAttachmentId, 
                    cardAttachmentActionType:'DELETE'};
                const result = await apiModifyCard(card);
                return({fileName:responseMessage.fileName, filePath:responseMessage.filePath});
              }
    }catch(err){
        console.error(err);
        return ({message:'파일 삭제 중 오류가 발생했습니다.'});
    }
};
