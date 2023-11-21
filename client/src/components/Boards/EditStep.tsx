import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm, useSteps } from '../../hooks';
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
}
const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onClose }:IEditStep) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      if(nameField.current)
        console.log(nameField.current);
       // nameField.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [defaultData, onUpdate, onClose, data]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  useEffect(() => {
    if(nameField.current)
      console.log(nameField.current);
    //  nameField.current.select();
  }, []);

  if (step && step.type === StepTypes.DELETE) {
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
      <Popup.Header>
        {t('common.editBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <Button positive content={t('action.save')} />
        </Form>
        <Button
          content={t('action.delete')}
          className={styles.deleteButton}
          onClick={handleDeleteClick}
        />
      </Popup.Content>
    </>
  );
});

export default EditStep;
