import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef , useState} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Popup as SemanticUIPopup, Form } from 'semantic-ui-react';
//import usePopup  from '../../lib/hook/use-popup';
import {useForm} from "react-hook-form";

import DeletePopup from '../DeletePopup';

import styles from './EditStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

interface IEditStep{
  defaultData: any;
  onUpdate:  any;
  onDelete:  any;
  onClose:  any;
  canEdit : boolean;
}
const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onClose, canEdit }:IEditStep) => {
  const [t] = useTranslation();

  const [boardName, setBoardName] = useState(defaultData.BoardName );

  const {register, handleSubmit,formState:{errors}} = useForm();

  const onValid = (data:any)=>{
    console.log('Information Edit', data);
   onUpdate(data);
  }

  
  const [step, setStep] = useState<string | null>(null);
  const nameField = useRef(null);

  // const handleSubmit = useCallback(() => {
  //  const cleanData = {
  //    ...data,
  //    name: data.name.trim(),
  //  };

  //  if (!cleanData.name) {
  //    if(nameField.current)
  //      console.log(nameField.current);
  //      nameField.current.select();
  //    return;
  //  }

  //   if (!dequal(cleanData, defaultData)) {
  //     onUpdate(cleanData);
  //   }

  //   onClose();
  // }, [defaultData, onUpdate, onClose, data]);

  const handleDeleteClick = useCallback(() => {
    setStep(StepTypes.DELETE);
  }, [setStep]);

  const handleBack = useCallback(() => {
    onClose();
  }, []);

  const handleFieldChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    if(canEdit === true){
    const {value} = e.target;
    setBoardName(value);
    }
  };

  useEffect(() => {
    if(nameField.current)
      console.log(nameField.current);
    //  nameField.current.select();
  }, []);

  if (step && step === StepTypes.DELETE) {
    return (
      <DeletePopup
      title="common.deleteBoard"
      content="common.areYouSureYouWantToDeleteThisBoard"
      buttonContent="action.deleteBoard"
      onConfirm={onDelete}
      onBack={handleBack}
    />
    );
  }

  return (
    <>
      <SemanticUIPopup.Header className={styles.wrapper}>
        {t('common.editBoard', {
          context: 'title',
        })}
      </SemanticUIPopup.Header>
      <SemanticUIPopup.Content className={styles.content}>
        <Form onSubmit={handleSubmit(onValid)}>
          <div className={styles.text}>{t('common.title')}</div>
          <input
            {...register("boardName", {
              required:"board name is required."
            })}
            ref={nameField}
            name="BoardName"
            value={boardName}
            style = {{
              marginBottom: '8px',
            }}
            onChange={handleFieldChange}
          />
          <Button positive 
            content={t('action.save')} 
            className={styles.field}
          />
        </Form>
        <Button 
          content={t('action.delete')}
          className={styles.deleteButton}
          onClick={handleDeleteClick}
        />
      </SemanticUIPopup.Content>
    </>
  );
});

export default EditStep;
