import { useCallback, useState, useRef, Children } from 'react';
import { Button, Checkbox, Icon, Popup, Menu } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../scss/TaskItem.module.scss';
import NameEdit from './NameEdit';

interface ITaskItemProps {
    id: string;
    index: number;
    name: string;
    isCompleted: boolean;
    //isPersisted: boolean;
    canEdit: boolean;
    onUpdate: (data: any) => void;
    onDelete: () => void;
};

const TaskItem = ({ id, index, name, isCompleted, /*isPersisted,*/ canEdit, onUpdate, onDelete }:ITaskItemProps) => {
  const nameEdit = useRef<any>(null);
  const popupShow = useRef<any>(null);
  const [t] = useTranslation();
  const [isPopUpShowed, setIsPopupShowed] = useState(false);

  const handleClick = useCallback(() => {
    console.log("handleClick / Item");
    if (/*isPersisted &&*/ canEdit
      && nameEdit.current) {
      nameEdit.current.open();
    }
  }, [/*isPersisted,*/ canEdit]);

  const handleNameUpdate = useCallback((newName:string) => {
    onUpdate({
      taskName: newName,
    });
  }, [onUpdate]);

  const handleToggleChange = useCallback(() => {
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    console.log("handleNameEdit");
    nameEdit.current.open();
  }, []);

  const handleClosePopup = useCallback(() => {
    console.log("handleClosePopup");
    if(popupShow.current) {
      popupShow.current.click();
    }
  }, []);

    //const ActionsPopup = usePopup(ActionsStep);

    return ( 
        //{({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        //  const contentNode = (
            // eslint-disable-next-line react/jsx-props-no-spreading
        //    <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            <div className={styles.wrapper}>
              <span className={styles.checkboxWrapper}>
                <Checkbox
                  checked={isCompleted}
                  disabled={/*!isPersisted ||*/ !canEdit}
                  className={styles.checkbox}
                  onChange={handleToggleChange}
                />
              </span>
              <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
                <div className={classNames(canEdit && styles.contentHoverable)}>
                  <span
                    className={classNames(styles.text, canEdit && styles.textEditable)}
                    onClick={handleClick}
                  >
                    <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
                      {name}
                    </span>
                  </span>
                  {canEdit && (
                    //<Popup onNameEdit={handleNameEdit} onDelete={onDelete}>
                    <Popup
                      trigger = {
                        <Button className={classNames(styles.button, styles.target)}>
                          <Icon fitted name="pencil" size="small" />
                        </Button>
                      }
                      on='click'
                      position='bottom right'
                      ref={popupShow}
                    >
                      <Popup.Header>
                        <span>{t('common.taskActions', {
                          context: 'title',
                        })}</span>
                        <span>
                          <Button icon="close" onClick={handleClosePopup} className={styles.closeButton} />
                        </span>
                      </Popup.Header>
                      <Popup.Content>
                      <Menu secondary vertical className={styles.menu}>
                        <Menu.Item className={styles.menuItem} onClick={handleNameEdit}>
                          {t('action.editDescription', {
                            context: 'title',
                          })}
                        </Menu.Item>
                        <Menu.Item className={styles.menuItem} onClick={onDelete}>
                          {t('action.deleteTask', {
                            context: 'title',
                          })}
                        </Menu.Item>
                      </Menu>
                      </Popup.Content>
                    </Popup>
                  )}
                </div>
              </NameEdit>
            </div>
          //);

          //return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
        //}}
    );
};

export default TaskItem;
