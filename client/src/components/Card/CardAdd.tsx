import React, {useEffect, useRef} from "react";
import styles from "./CardAdd.module.scss";
import { Button, Form } from 'semantic-ui-react';
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {IModifyCard, defaultModifyCard, ICard} from "../../atoms/atomCard";
import {cardsSelector} from "../../atoms/atomsBoard";
import {useCookies} from "react-cookie";
import {apiCreateCard} from "../../api/card";
import {useRecoilState } from "recoil";

interface ICardAddProps{
  listId:string;
  setIsCardAddOpened:(value:boolean) => void;
  isCardRequery : boolean;
  setIsCardRequery : (value:boolean) => void;
}

function CardAdd({listId, setIsCardAddOpened,isCardRequery, setIsCardRequery}:ICardAddProps){
  const [t] = useTranslation();
  const {register, handleSubmit, formState:{errors}} = useForm();
  const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
  const [cards, setCards] = useRecoilState(cardsSelector);

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
      setIsCardAddOpened(false);
    }
  }     
   
  const onValid = async(data:any) => {
    const card : IModifyCard = {...defaultModifyCard, ...data, cardActionType:'ADD', listId:listId, userId:cookies.UserId };
    const response = await apiCreateCard(card);
    if(response)
    {
      if(response.message){
        setIsCardAddOpened(true);
      }else{
        // recoil 변경 
        const newCard:ICard = {cardId:response.outCardId, listId:listId, creatorUserId:cookies.UserId,
               cardName:data.cardName, position:response.outCardPosition, createdAt:response.outCardCreatedAt, updatedAt:"", 
                coverAttachmentId:"", boardId:"", 
               description:"",  labels:[], 
               dueDate:"", statusId:"", statusName:"",
               stopwatch:null, memberships:[], attachments:[], 
               tasks:[], comments:[], };
        const updateCards = [...cards, newCard];
        setCards(updateCards);
        setIsCardAddOpened(false);
        setIsCardRequery(!isCardRequery);
      } 
    }   
  };

  const handleControlMouseOver = () => {
  };

  const handleControlMouseOut = () => {
  };

  return (
    <div ref={wrapperRef}>
      <Form className={styles.wrapper} onSubmit={handleSubmit(onValid)} >
        <div className={styles.fieldWrapper}>
            <textarea
            {...register("cardName", {
              required:"Card name is required."
            }) }
            placeholder={t('common.enterCardTitle')}
            rows={3} 
            cols={33}
            spellCheck={false}
            className={styles.field}
            />
        </div>
        <div className={styles.controls}>
            <Button
              positive
              content={t('action.addCard')}
              className={styles.submitButton}
              onMouseOver={handleControlMouseOver}
              onMouseOut={handleControlMouseOut}
            />
        </div>
      </Form>
    </div>
  );
};

export default CardAdd;