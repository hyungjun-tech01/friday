import { dequal } from 'dequal';
import { cloneElement, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../lib/ui/CustomPopupHeader';
import DeletePopup from './DeletePopup';

import styles from '../scss/AttachmentItemEditPopup.module.scss';

interface IAttachmentItemEditDataProps {
  name : string
}

interface IAttachmentItemEditProps {
  children: ReactNode,
  defaultData: object;
  onUpdate: (data: IAttachmentItemEditDataProps) => void;
  onDelete: () => void;
}

const AttachmentItemEditPopup = ({
  children,
  defaultData,
  onUpdate,
  onDelete,
}: IAttachmentItemEditProps) => {
  // Popup Control Part ---------------------
  const [t] = useTranslation();
  const popupRef = useRef<any>(null);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleMouseDown = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleTriggerClick = useCallback(() => {
    setIsOpened(!isOpened);
  }, [isOpened]);

  const trigger = cloneElement(children as ReactElement<any>, {
    onClick: handleTriggerClick,
  });

  // AttachmentItemEdit Membership Part ---------------------
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

    handleClose();
  }, [defaultData, onUpdate, handleClose, data]);

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

  const contentNode = (
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
    <Popup
      basic
      wide
      ref={popupRef}
      trigger={trigger}
      on="click"
      open={isOpened}
      position="bottom left"
      popperModifiers={[
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            padding: 20,
          },
        },
      ]}
      className={styles.popupWrapper}
      onOpen={handleOpen}
      onClose={handleClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div>
        <Button
          icon="close"
          onClick={handleClose}
          className={styles.popupCloseButton}
        />
        {contentNode}
      </div>
    </Popup>
  );
};

export default AttachmentItemEditPopup;
