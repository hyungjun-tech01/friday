import {useEffect, useRef} from "react";
import styles from "../scss/CardAdd.module.scss";
import { Button, Form, TextArea } from 'semantic-ui-react';

interface ICardAddProps{
    setIsCardAddOpened:(value:boolean) => void;
}
function CardAdd({setIsCardAddOpened}:ICardAddProps){
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
        setIsCardAddOpened(false);
      }
    }        
    return (
        <div ref={wrapperRef}>
            <Form>
        <div className={styles.fieldWrapper}>
            <TextArea
            ref={nameField}
            as={TextareaAutosize}
            name="name"
            placeholder={t('common.enterCardTitle')}
            minRows={3}
            spellCheck={false}
            className={styles.field}
            />
      </div>
      <div className={styles.controls}>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <Button
          content={t('action.addCard')}
          className={styles.submitButton}
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        />
      </div>
      </Form>
        </div>
    );
}

export default CardAdd;