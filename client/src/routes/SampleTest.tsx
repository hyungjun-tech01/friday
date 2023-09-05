 ///// api 호출 sample code 
import {useEffect} from 'react';
 import {ICard, defaultCard} from "../atoms/atomCard";
 import {IModifyCard, defaultModifyCard} from "../atoms/atomCard";
 import {apiModifyCard} from "../api/card";
 // cardId, userId는 반드시 들어가야 함. 
 // 필요에 따라 Actiontype 과 값들을 적절하게 세팅하여 호출 : 아래는 descriptipon 변경 방법
  const cardModifySample = async() => {
     const card : IModifyCard = {...defaultModifyCard, 
       cardId:'1057243275443832054', 
       userId:'967860418955445249',
       cardTaskActionType:'ADD',
       cardTaskName:'테스트입니다2',
       cardTaskPosition:"1000",
     };
     console.log(card);
     const response = await apiModifyCard(card);
     console.log('moddify response', response);
   }    
 ///// sample code 


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