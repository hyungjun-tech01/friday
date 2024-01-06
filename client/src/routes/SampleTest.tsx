 ///// api 호출 sample code 
import React, {useEffect, useState} from 'react';
 import {ICard, defaultCard, IModifyCard, defaultModifyCard} from "../atoms/atomCard";
 import {IModifyBoard, defaultModifyBoard,cardSelectorCardId } from "../atoms/atomsBoard";
 import {IModifyList, defaultModifyList} from "../atoms/atomsList";
 import {getProjectIdBoardIdbyCardId, apiModifyCard, apiUploadAttatchment, apiDeleteAttatchment} from "../api/card";
import {  apiModifyList } from '../api/list';
import {useRecoilValue} from "recoil";
import Paths from "../constants/Paths";
const BASE_PATH = Paths.BASE_PATH; 
 // cardId, userId는 반드시 들어가야 함. 
 // 필요에 따라 Actiontype 과 값들을 적절하게 세팅하여 호출 : 아래는 descriptipon 변경 방법

 // Update comment Sample 
  const cardModifySample = async() => {
 
    

    //  const board : IModifyCard = {...defaultModifyBoard, 
    //    boardId:'1016265084713829473', 
    //    userId:'967860418955445249',
    //    boardLabelActionType : 'DELETE',
    //    labelId : '1073004397610403292',
    //    labelName :'테스트',
    //    labelColor : 'red',
    //    //
    //  };
     const card : IModifyCard = {...defaultModifyCard, 
      boardId:'1016265084713829473', 
      userId:'967860418955445249',
      cardAttachmentActionType : 'COVER DELETE',
      coverAttachmentId : '1027147958514091150',
      cardId :'1070074530363344303',

      //
    };
    const list : IModifyList = {...defaultModifyList, 
      boardId:'1016265084713829473', 
      userId:'967860418955445249',
      listActionType : 'DELETE',
      listName : '102714795851409',
      listId : '1077538116836787739'
           //
    };
     const response = await apiModifyCard(card);
     // const response = await apiModifyBoard(board);
    // const response = await apiModifyList(list);
    // const response = await apiGetCurrentBoards('1016265084713829473');
     console.log('modify response', response);

   }    
   const getPorjectIdBoardIdbyCardId = async()=>{
    const response = await getProjectIdBoardIdbyCardId('1044698334536664235');
    console.log(response);

   }
 ///// sample code         stopwatch :{total:'1000', startedAt:'2023.09.01'}


function SampleTest(){
//  const aa  = useRecoilValue(listSelector); 
//    const list = aa('1071594612235175380');
//    console.log('list', list);
const [file, setFile] = useState<File | null>(null);
const [fileName, setFileName] = useState('');
// const [fileGroup, setFileGroup] = useState('');

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile||null);
};

const onClick = async (e:any) => {
  
  e.preventDefault();

  const formData = new FormData();
  formData.append('cardId', '1061602846295721255');
  formData.append('fileName', fileName);
  formData.append('fileExt', 'png');
  formData.append('userId','1111');
  if(file !== null)
  {
    formData.append('file', file);
    // 파일 업로드 인풋 요소에서 파일 가져오기
    const fileInput = document.getElementById('fileInput') as HTMLInputElement; // 파일 업로드 인풋 요소
    const fileData = fileInput.files ? fileInput.files[0] : null; // 첫 번째 파일을 가져옴

    if (fileData) {
    // 파일 width height 추출 
    if (fileData.type.startsWith('image/')) {
      const image = new Image();
      image.src = URL.createObjectURL(fileData);
  
      image.onload = async () => {
        const width = image.width ;
        const height = image.height ;
  
        // 너비와 높이를 문자열로 변환하여 FormData에 추가
        formData.append('width', width.toString());
        formData.append('height', height.toString());
  
        const response = await apiUploadAttatchment(formData);
      
        if(response)
          if(response.message)
            console.log('파일 업로드시 에러 발생');
          else
            console.log(response.fileName, response.dirName, response.outAttachmentId, response.outAttachmentCreatedAt);   

      };
    }else{
          
      const response = await apiUploadAttatchment(formData);
      
      if(response)
        if(response.message)
          console.log('파일 업로드시 에러 발생');
        else
            console.log(response.fileName, response.dirName, response.outAttachmentId, response.outAttachmentCreatedAt);    
    }

  }

  }
}

const onDelete = async()=>{
  const deleteCard = {cardAttachmentId:'1087542108216100425', userId:'1111', cardId:'1061603352028120361', fileExt:'png', fileName:'aaaa'};
  const response = await apiDeleteAttatchment(deleteCard);

  if(response)
    if(response.message)
      console.log('파일 삭제시 에러 발생');
    else
      console.log('파일 삭제', response.fileName, response.filePath);
}

  useEffect( ()=>{
      // cardModifySample();
      getPorjectIdBoardIdbyCardId();
   },[]);

    return(
        <div>
          <form id="form" onSubmit={onClick}>
          <input id="fileInput" type="file" name="file"  accept=".png, .jpg, .jpeg, .gif, .txt" onChange={handleFileChange}/>
            <input type = "text" name="cardId" value = "1061603352028120361"/>
            <input type="text" name="fileName" value = {fileName} onChange={(e)=>setFileName(e.target.value)}/>
            <button type="submit" >업로드</button>
          </form>
          <input type="button" value="삭제" onClick={onDelete}/> 
        </div>
    );
}
export default SampleTest;