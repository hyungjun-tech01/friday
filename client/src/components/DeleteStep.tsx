import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';


import styles from '../scss/DeleteStep.module.scss';

interface IDeleteStep{
    title : string;
    content : string;
    buttonContent : string;
    onConfirm : ()=>void;
    onBack : () => void;
}
function DeleteStep ({ title, content, buttonContent, onConfirm, onBack }:IDeleteStep) {
    return (
        <>
          <div onClick={onBack}>
            {title}
          </div>
          <div>
            <div className={styles.content}>{content}</div>
            <Button fluid negative content={buttonContent} onClick={onConfirm} />
          </div>
        </>
      );
}

export default DeleteStep;
