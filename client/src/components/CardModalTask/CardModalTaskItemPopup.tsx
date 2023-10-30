import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import DeletePopup from '../DeletePopup';
import styles from './CardModalTaskItemPopup.module.scss';

const StepTypes = {
  DELETE : 'DELETE'
}

interface CardModalTaskItemPopupProps {
  onNameEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const CardModalTaskItemPopup = ({
  onNameEdit,
  onDelete,
  onClose,
}: CardModalTaskItemPopupProps) => {
  const [t] = useTranslation();
  const [step, setStep] = useState<string | null>(null);

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleDeleteClick = useCallback(() => {
    setStep(StepTypes.DELETE);
  }, [setStep]);

  const handleBack = useCallback(() => {
    setStep(null);
  }, [setStep]);

  if (step === StepTypes.DELETE) {
    return (
      <DeletePopup
        title="common.deleteTask"
        content="common.areYouSureYouWantToDeleteThisTask"
        buttonContent="action.deleteTask"
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <CustomPopupHeader>
        {t('common.taskActions', {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
            {t('action.editDescription', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteTask', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
};

export default CardModalTaskItemPopup;
