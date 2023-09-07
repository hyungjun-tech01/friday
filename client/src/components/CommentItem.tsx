import { useCallback, useRef } from 'react'
import { Comment } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import formatDate from 'date-fns/format';
import classNames from 'classnames';
import styles from '../scss/CommentItem.module.scss';
import User from './User';
import NameEdit from './NameEdit'

interface ICommentItemProps {
  commentId: string;
  userName: string;
  createdAt: string;
  updatedAt: string | null;
  data: string;
  canEdit: boolean;
  onUpdate: (id:string, data:string) => void;
  onDelete: (id:string) => void;
}

const CommentItem = ({commentId, userName, createdAt, updatedAt, data, canEdit, onUpdate, onDelete}:ICommentItemProps) => {
    const [t] = useTranslation();
    const commentEdit = useRef<any>(null);
    const formatted_date = new Date(updatedAt ? updatedAt : createdAt);

    const handleEditClick = useCallback(() => {
      console.log("handleEditClick / Comment");
      if (commentEdit.current) {
        commentEdit.current.open();
      }
    }, []);

    const handleDeleteClick = useCallback(() => {
      console.log("handleDeleteClick / Comment");
      onDelete(commentId);
    }, [onDelete, commentId]);

    const handleCommentUpdate = useCallback((newComment:string) => {
      onUpdate(commentId, newComment);
    }, [onUpdate, commentId]);

    return (
      <Comment>
        <span className={styles.user}>
          <User userName={userName} avatarUrl={undefined} />
        </span>
        <div className={classNames(styles.content)}>
          <div className={styles.title}>
            <span className={styles.author}>{userName}</span>
            <span className={styles.date}>
            {formatDate(formatted_date, " M'월'd'일 ' HH:MM")}
            </span>
          </div>
          <NameEdit ref={commentEdit} defaultValue={data} onUpdate={handleCommentUpdate}>
            <div className={styles.text}>
              {data}
            </div>
            {canEdit && (
                <Comment.Actions>
                  <Comment.Action
                    //as="button"
                    content={t('action.edit')}
                    onClick={handleEditClick}
                  />
                  <Comment.Action
                    //as="button"
                    content={t('action.delete')}
                    onClick={handleDeleteClick}
                  />
                </Comment.Actions>
              )}
          </NameEdit>
          {/* <CommentEdit ref={commentEdit} defaultData={data} onUpdate={onUpdate}>
            <>
              <div className={styles.text}>
                <Markdown linkTarget="_blank">{data.text}</Markdown>
              </div>
              {canEdit && (
                <Comment.Actions>
                  <Comment.Action
                    as="button"
                    content={t('action.edit')}
                    disabled={!isPersisted}
                    onClick={handleEditClick}
                  />
                  <DeletePopup
                    title="common.deleteComment"
                    content="common.areYouSureYouWantToDeleteThisComment"
                    buttonContent="action.deleteComment"
                    onConfirm={onDelete}
                  >
                    <Comment.Action
                      as="button"
                      content={t('action.delete')}
                      disabled={!isPersisted}
                    />
                  </DeletePopup>
                </Comment.Actions>
              )}
            </>
          </CommentEdit> */}
        </div>
      </Comment>
    );
};

export default CommentItem;