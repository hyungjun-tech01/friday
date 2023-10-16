import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Popup } from 'semantic-ui-react';
import styles from './ActionsStep.module.scss';

import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import DeletePopup from '../DeletePopup';

const StepTypes = {
    DELETE: 'DELETE',
  };
  

interface IActionsStep{
    onNameEdit:()=>void;
    onCardAdd:()=>void;
    onDelete:()=>void;
    onClose:()=>void; 
}
function ActionsStep({ onNameEdit, onCardAdd, onDelete, onClose }:IActionsStep){
    const [t] = useTranslation();
    const [step, setStep] = useState<string | null>(null);
  
    const handleEditNameClick = useCallback(() => {
      onNameEdit();
      onClose();
    }, [onNameEdit, onClose]);
    const handleAddAnotherCard = useCallback(() => {
      onCardAdd();
      onClose();
    }, [onCardAdd, onClose]);
 
    const handleDeleteClick = useCallback(() => {
      setStep(StepTypes.DELETE);
    }, [setStep]);
  
    const handleBack = useCallback(() => {
      setStep(null);
    }, [setStep]);
  
    if (step === StepTypes.DELETE) {
      return (
        <DeletePopup
          title="common.listDelete"
          content="common.areYouSureYouWantToDeleteThisList"
          buttonContent="action.listDelete"
          onConfirm={onDelete}
          onBack={handleBack}
        />
      );
    }

    return(
        <>
        <CustomPopupHeader>
          {t('common.listAction', {
            context: 'title',
          })}
        </CustomPopupHeader>
        <Popup.Content>
          <Menu secondary vertical className={styles.menu}>
            <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
              {t('action.listNameEdit', {
                context: 'title',
              })}
            </Menu.Item>
            <Menu.Item className={styles.menuItem} onClick={handleAddAnotherCard}>
              {t('action.addAnotherCard', {
                context: 'title',
              })}
            </Menu.Item>            
            <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
              {t('action.listDelete', {
                context: 'title',
              })}
            </Menu.Item>
          </Menu>
        </Popup.Content>
      </>
    );
}
export default ActionsStep;