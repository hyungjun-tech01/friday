import { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
//import { Draggable } from 'react-beautiful-dnd';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
//import { usePopup } from '../../../lib/popup';

//import NameEdit from './NameEdit';
//import ActionsStep from './ActionsStep';

import styles from '../scss/Item.module.scss';

interface IItemProps {
    id: string;
    index: number;
    name: string;
    isCompleted: boolean;
    isPersisted: boolean;
    canEdit: boolean;
    onUpdate: (data: any) => void;
    onDelete: () => void;
};

const Item = ({ id, index, name, isCompleted, isPersisted, canEdit, onUpdate, onDelete }:IItemProps) => {
    //const nameEdit = useRef<any>(null);

    // const handleClick = useCallback(() => {
    //   if (isPersisted && canEdit) {
    //     nameEdit.current.open();
    //   }
    // }, [isPersisted, canEdit]);

    const handleClick = useCallback(() => {
        console.log("Item is clicked.")
      }, []);

    const handleNameUpdate = useCallback(
    //   (newName) => {
    //     onUpdate({
    //       name: newName,
    //     });
    //   },
    //   [onUpdate],
        ()=> console.log("Item - update name"),
        []
    );

    // const handleToggleChange = useCallback(() => {
    //   onUpdate({
    //     isCompleted: !isCompleted,
    //   });
    // }, [isCompleted, onUpdate]);

    // const handleNameEdit = useCallback(() => {
    //   nameEdit.current.open();
    // }, []);

    //const ActionsPopup = usePopup(ActionsStep);

    return ( 
        //{({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        //  const contentNode = (
            // eslint-disable-next-line react/jsx-props-no-spreading
        //    <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            <div>
              <span className={styles.checkboxWrapper}>
                <Checkbox
                  checked={isCompleted}
                  disabled={!isPersisted || !canEdit}
                  className={styles.checkbox}
                  //onChange={handleToggleChange}
                />
              </span>
              
                <div className={classNames(canEdit && styles.contentHoverable)}>
                  <span
                    className={classNames(styles.text, canEdit && styles.textEditable)}
                    onClick={handleClick}
                  >
                    <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
                      {name}
                    </span>
                  </span>
                  {/* {isPersisted && canEdit && (
                    <ActionsPopup onNameEdit={handleNameEdit} onDelete={onDelete}>
                      <Button className={classNames(styles.button, styles.target)}>
                        <Icon fitted name="pencil" size="small" />
                      </Button>
                    </ActionsPopup>
                  )} */}
                </div>
              
            </div>
          //);

          //return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
        //}}
    );
};



export default Item;
