import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import styles from "../scss/AddBoardModal.module.scss";
import {useForm} from "react-hook-form";
import {ICreateBoard} from "../atoms/atomsBoard";
import {apiCreateBoard} from "../api/board";
import {useCookies} from "react-cookie";
import {useState, useRef, useEffect} from "react";


// notimodal props interface 정의 
interface IAddBoardModalProp{
  projectId:string;
  setShowCreateModal:(value:boolean) => void;
  endXPosition: boolean;
} 

function AddBoardModal({endXPosition, projectId, setShowCreateModal}:IAddBoardModalProp){
  const [t] = useTranslation();
  const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
  const {register, handleSubmit,formState:{errors}} = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  let wrapperRef = useRef<any>(null); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    useEffect(()=>{
      document.addEventListener('mousedown', handleClickOutside);
      return()=>{
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }, []);

    const handleClickOutside=(event:any)=>{
      if (wrapperRef && 
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target)) {
        console.log('close modal');
        setShowCreateModal(false);
      }
    }     

  const onValid = async (data:any) =>{
    const board : ICreateBoard= {...data, projectId:projectId, userId:cookies.UserId};
    
    const response = await apiCreateBoard(board);
      if(response.message){
        setShowCreateModal(true);
      }else{
        setShowCreateModal(false);
      }
  } 


  if (endXPosition) {
    return(
      <div ref={wrapperRef}>
        <div className = {styles.overlay_left} > 
          <div className = {styles.modal}>
          <div className={styles.title}>
            {t('common.createBoard_title')}
          </div>
          <div>
            <Form onSubmit={handleSubmit(onValid)}>
              <input 
                {...register("boardName", {
                  required:"board name is required."
                }) }
                type="text"
                name="boardName"
                className={styles.field}
                readOnly={isSubmitting}
              />
              <div className={styles.controls}>
                <Form.Button positive content={t('action.createBoard')} className={styles.createButton} />
              </div>
            </Form>
          </div>
        </div>
        </div>
      </div>
    );
  }else{
    return(
      <div ref={wrapperRef}>
        <div className = {styles.overlay} > 
          <div className = {styles.modal}>
          <div className={styles.title}>
            {t('common.createBoard_title')}
          </div>
          <div>
            <Form onSubmit={handleSubmit(onValid)}>
              <input 
                {...register("boardName", {
                  required:"board name is required."
                }) }
                type="text"
                name="boardName"
                className={styles.field}
                readOnly={isSubmitting}
              />
              <div className={styles.controls}>
                <Form.Button positive content={t('action.createBoard')} className={styles.createButton} />
              </div>
            </Form>
          </div>
        </div>
        </div>
      </div>      
    );    
  }
}

export default AddBoardModal;