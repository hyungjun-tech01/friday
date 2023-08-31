import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Comment, Icon } from 'semantic-ui-react';
import styles from '../scss/Activities.module.scss';
import { IAction } from '../atoms/atomAction';
import CommentAdd from './CommentAdd';
import Item from './Item'

interface IActivityProps{
  items: IAction[];
  isDetailsVisible: boolean;
  canEdit: boolean;
};

const Activities = ({items, isDetailsVisible, canEdit} : IActivityProps) => {
  const [t] = useTranslation();

  const handleToggleDetailsClick = useCallback(() => {
    // onDetailsToggle(!isDetailsVisible);
    console.log("Toggle the detail of Activities : ", isDetailsVisible)
  }, [isDetailsVisible/*, onDetailsToggle*/]);

  const handleCommentUpdate = useCallback(
    (id:string, data:any) => {
      // onCommentUpdate(id, data);
      console.log("Update comment / id, data : ", id, data);
    }, [/*onCommentUpdate*/]);

  const [comments, setComments] = useState([]);

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
                <Comment>
                  <Comment.Author as='a'>{item.userName}</Comment.Author>
                  <Comment.Metadata>
                    <div>{item.updatedAt ? item.updatedAt : item.createdAt}</div>
                  </Comment.Metadata>
                  <Comment.Text>{item.data.text}</Comment.Text>
                  <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                  </Comment.Actions>
                </Comment>
              ))}
            </Comment.Group>
          </div>
      </div>
    </div>
  );
};

export default Activities;
