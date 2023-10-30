import  React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
//import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Progress } from 'semantic-ui-react';
//import { closePopup } from '../../../lib/popup';
import { ITask } from "../atoms/atomTask";

//import DroppableTypes from '../../../constants/DroppableTypes';
import CardModalTaskItem from './CardModalTask/CardModalTaskItem';
import CardModalTaskAdd from './CardModalTaskAdd';

import styles from '../scss/CardModalTasks.module.scss';

interface ICardModalTasksProps{
    items: ITask[];
    canEdit: boolean;
    onCreate: (data: string) => void;
    onUpdate: (id: string, data: any) => void;
    onMove?: () => void;
    onDelete: (id: string) => void;
  };

const CardModalTasks = ({ items, canEdit, onCreate, onUpdate, onMove, onDelete }:ICardModalTasksProps) => {
  const [t] = useTranslation();

//   const handleDragStart = useCallback(() => {
//     closePopup();
//   }, []);

//   const handleDragEnd = useCallback(
//     ({ draggableId, source, destination }) => {
//       if (!destination || source.index === destination.index) {
//         return;
//       }

//       onMove(draggableId, destination.index);
//     },
//     [onMove],
//   );

  const handleUpdate = useCallback(
    (id: string, data: any) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete],
  );

  const completedItems = items.filter((item:ITask) => item.isCompleted);

  return (
    <>
      {items.length > 0 && (
        <Progress
          autoSuccess
          value={completedItems.length}
          total={items.length}
          color="blue"
          size="tiny"
          className={styles.progress}
        />
      )}
        {/*({ innerRef, droppableProps, placeholder }) => (
          <div {...droppableProps} ref={innerRef}>*/
          <div>
            {items.map((item, index) => (
              <CardModalTaskItem
                key={item.taskId}
                id={item.taskId}
                index={index}
                name={item.taskName}
                isCompleted={item.isCompleted}
                //isPersisted={item.isPersisted}
                canEdit={canEdit}
                onUpdate={(data:any) => handleUpdate(item.taskId, data)}
                onDelete={() => handleDelete(item.taskId)}
              />
            ))}
            {canEdit && (
              <CardModalTaskAdd onCreate={onCreate}>
                <button type="button" className={styles.taskButton}>
                  <span className={styles.taskButtonText}>
                    {items.length > 0 ? t('action.addAnotherTask') : t('action.addTask')}
                  </span>
                </button>
              </CardModalTaskAdd>
            )}
          </div>
        /*)*/}
    </>
  );
};

export default CardModalTasks;
