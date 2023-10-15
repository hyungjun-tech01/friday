import { useCallback, useState, useRef } from 'react';
import { Button, Checkbox, Icon, Popup, Menu } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import NameEdit from '../NameEdit';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import CardModalTaskItemPopup from './CardModalTaskItemPopup';

import usePopup from '../../lib/hook/use-popup';
import classNames from 'classnames';
import styles from './CardModalTaskItem.module.scss';

interface ICardModalTaskItemProps {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  //isPersisted: boolean;
  canEdit: boolean;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const CardModalTaskItem = ({
  id,
  index,
  name,
  isCompleted,
  /*isPersisted,*/ canEdit,
  onUpdate,
  onDelete,
}: ICardModalTaskItemProps) => {
  const nameEdit = useRef<any>(null);
  const popupShow = useRef<any>(null);
  const [t] = useTranslation();
  const [isPopUpShowed, setIsPopupShowed] = useState(false);

  const handleClick = useCallback(() => {
    console.log('handleClick / Item');
    if (/*isPersisted &&*/ canEdit && nameEdit.current) {
      nameEdit.current.open();
    }
  }, [/*isPersisted,*/ canEdit]);

  const handleNameUpdate = useCallback(
    (newName: string) => {
      onUpdate({
        taskName: newName,
      });
    },
    [onUpdate]
  );

  const handleToggleChange = useCallback(() => {
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    console.log('handleNameEdit');
    nameEdit.current.open();
  }, []);

  const TaskItemPopup = usePopup(CardModalTaskItemPopup);

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
            <span
              className={classNames(
                styles.task,
                isCompleted && styles.taskCompleted
              )}
            >
              {name}
            </span>
          </span>
          {canEdit && (
            <TaskItemPopup onNameEdit={handleNameEdit} onDelete={onDelete}>
              <Button className={classNames(styles.button, styles.target)}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </TaskItemPopup>
          )}
        </div>
      </NameEdit>
    </div>
    //);

    //return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
    //}}
  );
};

export default CardModalTaskItem;