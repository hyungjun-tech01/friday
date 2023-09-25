 ///// api 호출 sample code 
import {useEffect} from 'react';
 import {ICard, defaultCard, IModifyCard, defaultModifyCard} from "../atoms/atomCard";
 import {IModifyBoard, defaultModifyBoard, } from "../atoms/atomsBoard";
 import {IModifyList, defaultModifyList} from "../atoms/atomsList";
 import {apiModifyCard} from "../api/card";
import {  apiModifyList } from '../api/list';
import {useRecoilValue} from "recoil";
import {listSelector} from "../atoms/atomsBoard";
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
    //  const card : IModifyCard = {...defaultModifyCard, 
    //   boardId:'1016265084713829473', 
    //   userId:'967860418955445249',
    //   cardLabelActionType : 'DELETE',
    //   labelId : '1027147958514091150',
    //   cardId :'1027148357342069905',

    //   //
    // };
    const list : IModifyList = {...defaultModifyList, 
      boardId:'1016265084713829473', 
      userId:'967860418955445249',
      listActionType : 'DELETE',
      listName : '102714795851409',
      listId : '1077538116836787739'
           //
    };
     console.log(list); 
     // const response = await apiModifyBoard(board);
     const response = await apiModifyList(list);
    // const response = await apiGetCurrentBoards('1016265084713829473');
     console.log('modify response', response);

   }    
 ///// sample code         stopwatch :{total:'1000', startedAt:'2023.09.01'}


function SampleTest(){
//  const aa  = useRecoilValue(listSelector); 
//    const list = aa('1071594612235175380');
//    console.log('list', list);

  useEffect( ()=>{
      cardModifySample();
   },[]);

    return(
        <div>
            Sample Test
        </div>
    );
}
export default SampleTest;