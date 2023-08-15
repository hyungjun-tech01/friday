import {useRef, useEffect} from "react";
import { useTranslation } from 'react-i18next';
import styles from '../scss//BoardMemberAdd.module.scss';

interface IBoardmemberAddProps{
    setOnAddPopup:(value:boolean) => void;
}
function BoardMemeberAdd({setOnAddPopup}:IBoardmemberAddProps){
    const [t] = useTranslation();
    let wrapperRef = useRef<any>(null); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    useEffect(()=>{
      document.addEventListener('mousedown', handleClickOutside);
      return()=>{
        document.removeEventListener('mousedown', handleClickOutside);
      }
    });

    const handleClickOutside=(event:any)=>{
      if (wrapperRef && 
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target)) {
        console.log('close modal');
        setOnAddPopup(false);
      }
    }     

    return(
        <div ref={wrapperRef}>
            <div className={styles.title}> 
            {t('acommon.boardmemberadd_title')}
            </div>BoardMemeberAdd
        </div>
    );
}
export default BoardMemeberAdd;