import { Comment } from 'semantic-ui-react';
//import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../scss/CommentItem.module.scss';

const CommentItem = () => {
    //const [t] = useTranslation();

    return (
        <Comment>
          <span className={styles.user}>
            User 1
          </span>
          <div className={classNames(styles.content)}>
            <div className={styles.title}>
              {/* <span className={styles.author}>{user.name}</span>
              <span className={styles.date}>
                {t('format:longDateTime', {
                  postProcess: 'formatDate',
                  value: createdAt,
                })}
              </span> */}
            </div>
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