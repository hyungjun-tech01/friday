import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button , Popup as SemanticUIPopup} from 'semantic-ui-react';


import styles from '../scss/DeleteStep.module.scss';

interface IDeleteStep{
    boardId : string;
    userId : string;
    title : string;
    content : string;
    buttonContent : string;
    onConfirm : (userId:string, delboardId:string)=>void;
    onBack : () => void;
}
const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#9e3f08';
    e.currentTarget.style.color = 'white';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#db570a';
    e.currentTarget.style.color = 'white';
  };
  
function DeleteStep ({ boardId, userId, title, content, buttonContent, onConfirm, onBack }:IDeleteStep) {
    return (
        <div className={styles.overlay} > 
            <div className={styles.modal} >
            <SemanticUIPopup.Header className={styles.wrapper}>
                {onBack && <Button icon="angle left" onClick={onBack} className={styles.backButton} />}
                <div className={styles.popupcontent}>{title}</div>
            </SemanticUIPopup.Header>
            <div>
                    <div className={styles.content}>{content}</div>
                    <Button fluid positive 
                     style = {{
                        background : '#db570a',
                        color: 'white',
                        fontWeight: 'bold',
                        marginTop: '8px',
                        padding: '6px 11px',
                        textAlign: 'center',
                        transition: 'none',
                      }} 
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}                      
                    content={buttonContent} onClick={()=>onConfirm(userId, boardId)} />
              </div>
            </div>  
        </div>
      );
}

export default DeleteStep;
