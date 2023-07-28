import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import Popup from '../lib/custom-ui/Popup';
import styles from "../scss/AddBoardModal.module.scss";

// notimodal props interface 정의 
interface IAddBoardModalProp{
  setShowCreateModal:(value:boolean) => void;
} 

function AddBoardModal({setShowCreateModal}:IAddBoardModalProp){
    const [t] = useTranslation();
    const handleSubmit = ()=>{
      console.log('AddboardModal submit');
    }
    const handleFieldChange = ()=>{
      console.log('AddboardModal submit');
    }
    return(
        <div className={styles.controls}>
        <Popup.Header>
          {t('common.createBoard', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <input
              name="name"
              value={`board.name`}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.controls}>
              <Button positive content={t('action.createBoard')} className={styles.createButton} />
            </div>
          </Form>
        </Popup.Content>
      </div>
    );
}

export default AddBoardModal;