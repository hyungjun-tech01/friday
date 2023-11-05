import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { Draggable } from 'react-beautiful-dnd';
import NameEdit from '../../NameEdit';
import CardModalTaskItemPopup from './CardModalTaskItemPopup';

import usePopup from '../../../lib/hook/use-popup';
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
  const [t] = useTranslation();

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
    <Draggable draggableId={id} index={index} isDragDisabled={!canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          //eslint-disable-next-line react/jsx-props-no-spreading
          <div
            {...draggableProps}
            {...dragHandleProps}
            ref={innerRef}
            className={styles.wrapper}
          >
            <span className={styles.checkboxWrapper}>
              <Checkbox
                checked={isCompleted}
                disabled={/*!isPersisted ||*/ !canEdit}
                className={styles.checkbox}
                onChange={handleToggleChange}
              />
            </span>
            <NameEdit
              ref={nameEdit}
              defaultValue={name}
              type={'task'}
              onUpdate={handleNameUpdate}
            >
              <div className={classNames(canEdit && styles.contentHoverable)}>
                <span
                  className={classNames(
                    styles.text,
                    canEdit && styles.textEditable
                  )}
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
                  <TaskItemPopup
                    onNameEdit={handleNameEdit}
                    onDelete={onDelete}
                  >
                    <Button
                      className={classNames(styles.button, styles.target)}
                    >
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </TaskItemPopup>
                )}
              </div>
            </NameEdit>
          </div>
        );

        return isDragging
          ? ReactDOM.createPortal(contentNode, document.body)
          : contentNode;
      }}
    </Draggable>
  );
};

export default CardModalTaskItem;
