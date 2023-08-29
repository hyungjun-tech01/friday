import { useCallback, useRef } from 'react';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import { useRecoilState } from 'recoil';
import classNames from 'classnames';
import styles from '../scss/Item.module.scss';
import { atomCurrentEditElment, IEditElement } from '../atoms/atomEditState';
import NameEdit from './NameEdit';

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

  const nameEdit = useRef<any>(null);
  const [element, setElement] = useRecoilState<IEditElement>(atomCurrentEditElment);

  const handleClick = useCallback(() => {
    if (isPersisted && canEdit) {
      setElement({id: id, name: "NameEdit", properties: {open : true}});
    }
  }, [isPersisted, canEdit, setElement]);

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
    setElement({id: id, name: "NameEdit", properties: {open : true}});
  }, []);

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
                  onChange={handleToggleChange}
                />
              </span>
              <NameEdit defaultValue={name} parentId={id} onUpdate={handleNameUpdate}>
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
