import { useCallback, useState, useRef } from 'react';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import classNames from 'classnames';
import styles from '../scss/Item.module.scss';
import NameEdit from './NameEdit';

interface IItemProps {
    id: string;
    index: number;
    name: string;
    isCompleted: boolean;
    //isPersisted: boolean;
    canEdit: boolean;
    onUpdate: (data: any) => void;
    onDelete: () => void;
};

const Item = ({ id, index, name, isCompleted, /*isPersisted,*/ canEdit, onUpdate, onDelete }:IItemProps) => {
  const nameEdit = useRef<any>(null);

  const handleClick = useCallback(() => {
    console.log("handleClick / Item");
    if (/*isPersisted &&*/ canEdit
      && nameEdit.current) {
      nameEdit.current.open();
    }
  }, [/*isPersisted,*/ canEdit]);

  const handleNameUpdate = useCallback((newName:string) => {
    onUpdate({
      name: newName,
    });
  }, [onUpdate]);

  const handleToggleChange = useCallback(() => {
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    console.log("handleNameEdit");
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
                </div>
              </NameEdit>
            </div>
          //);

          //return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
        //}}
    );
};

export default Item;
