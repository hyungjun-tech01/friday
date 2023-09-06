import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Comment, Icon } from 'semantic-ui-react';
import styles from '../scss/Activities.module.scss';
import { IAction } from '../atoms/atomAction';
import CommentAdd from './CommentAdd';
import CommentItem from './CommentItem'

interface IActivityProps{
  items: IAction[];
  isDetailsVisible: boolean;
  canEdit: boolean;
  onCreate: (data:string) => void;
  onUpdate: (id:string, data:string) => void;
  onDelete: (id:string) => void;
};

const Activities = ({items, isDetailsVisible, canEdit, onCreate, onUpdate, onDelete} : IActivityProps) => {
  const [t] = useTranslation();

  const handleToggleDetailsClick = useCallback(() => {
    // onDetailsToggle(!isDetailsVisible);
    console.log("Toggle the detail of Activities : ", isDetailsVisible)
  }, [isDetailsVisible/*, onDetailsToggle*/]);

  const handleActionCreate = useCallback((data:string) => {
    onCreate(data);
  }, [onCreate]);

  const handleActionUpdate = useCallback((id:string, data:string) => {
      console.log("Update comment / id, data : ", id, data);
      onUpdate(id, data);
    }, [onUpdate]);

  const handleActionDelete = useCallback((id:string)=>{
    onDelete(id);
  }, [onDelete]);

  return (
    <div className={styles.contentModule}>
      <div className={styles.moduleWrapper}>
        <Icon name="list ul" className={styles.moduleIcon} />
        <div className={styles.moduleHeader}>
          {t('common.actions')}
          <Button
            content={isDetailsVisible ? t('action.hideDetails') : t('action.showDetails')}
            className={styles.toggleButton}
            onClick={handleToggleDetailsClick}
          />
        </div>
        {canEdit && <CommentAdd />}
        <div className={styles.wrapper}>
            <Comment.Group>
              {items.map((item) =>(
                <CommentItem 
                  key={item.actionId}
                  commentId = {item.actionId}
                  userName={item.userName}
                  createdAt={item.createdAt}
                  updatedAt={item.updatedAt}
                  data={item.data}
                  canEdit={canEdit}
                  onUpdate={handleActionUpdate}
                  onDelete={handleActionDelete}
                />
              ))}
            </Comment.Group>
          </div>
      </div>
    </div>
  );
};

export default Activities;
