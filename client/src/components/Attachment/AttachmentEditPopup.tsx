import { dequal } from 'dequal';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import DeletePopup from '../DeletePopup';
import styles from './AttachmentEditPopup.module.scss';

interface IAttachmentEditDataProps {
  name : string
}

interface IAttachmentEditProps {
  children: ReactNode,
  defaultData: object;
  onUpdate: (data: IAttachmentEditDataProps) => void;
  onDelete: () => void;
  onClose: () => void;
}

const AttachmentEditPopup = ({
  children,
  defaultData,
  onUpdate,
  onDelete,
  onClose,
}: IAttachmentEditProps) => {
  const [t] = useTranslation();
  
  const nameField = useRef<any>(null);
  const [data, setData] = useState(() => ({
    name: '',
    ...defaultData,
  }));
  const [nextStep, setNextStep] = useState<boolean>(false);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [defaultData, onUpdate, onClose, data]);

  const handleDeleteClick = useCallback(() => {
    setNextStep(true);
  }, [setNextStep]);

  const handleBack = useCallback(() => {
    setNextStep(false);
  }, [setNextStep]);

  const handleFieldChange = useCallback((event: any) => {
    const newData = {
      ...data,
      name: event.target.value,
    };
    setData(newData);
  }, [data]);

  useEffect(() => {
    if(nameField.current)
      nameField.current.focus();
  }, []);

  if (nextStep) {
    return (
      <DeletePopup
        title="common.deleteAttachment"
        content="common.areYouSureYouWantToDeleteThisAttachment"
        buttonContent="action.deleteAttachment"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <CustomPopupHeader>
        {t('common.editAttachment', {
          context: 'title',
        })}
      </CustomPopupHeader>
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
};

export default AttachmentEditPopup;
