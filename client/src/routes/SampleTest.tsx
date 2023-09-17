 ///// api 호출 sample code 
import {useEffect} from 'react';
 import {ICard, defaultCard} from "../atoms/atomCard";
 import {IModifyCard, defaultModifyCard} from "../atoms/atomCard";
 import {apiModifyCard} from "../api/card";
 // cardId, userId는 반드시 들어가야 함. 
 // 필요에 따라 Actiontype 과 값들을 적절하게 세팅하여 호출 : 아래는 descriptipon 변경 방법

 // Update comment Sample 
  const cardModifySample = async() => {
    const TIME_ZONE = 9 * 60 * 60 * 1000; // 9시간
    const d = new Date();

    const date = new Date(d.getTime() + TIME_ZONE).toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    const date_time = date + ' ' + time;
//    console.log(date + ' ' + time);

     const card : IModifyCard = {...defaultModifyCard, 
       cardId:'1061970265900057818', 
       userId:'967860418955445249',
      cardTaskActionType : 'UPDATE',
      cardTaskName : '...',
      cardTaskId : '1070922052166223211',
     };
     console.log(card); 
     const response = await apiModifyCard(card);
     console.log('moddify response', response);

   }    
 ///// sample code         stopwatch :{total:'1000', startedAt:'2023.09.01'}


function SampleTest(){
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