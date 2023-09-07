import { useState, useCallback, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from "react-query";
import Activities from "./Activities";
import DescriptionEdit from "./DescriptionEdit";
import Tasks from "./Tasks"
import Markdown from './Markdown';
import NameField from './NameField';
import User from './User'
import DueDate from './DueDate';
import Stopwatch from './Stopwatch';
import { apiGetInfosByCardId, apiModifyCard } from "../api/card"
import { IComment, defaultComment } from "../atoms/atomAction"
import { ILabel } from '../atoms/atomLabel';
import { ICard, atomCurrentCard, defaultCard, IModifyCard, defaultModifyCard } from '../atoms/atomCard';
import { ITask, defaultTask } from '../atoms/atomTask';
import { IMembership } from '../atoms/atomsUser';

import classNames from 'classnames';
import styles from "../scss/CardModal.module.scss";

interface IStopWatch {
  total: number;
  startedAt: Date | undefined;
}

const defaultStopWatch: IStopWatch = {
  total: 0, startedAt: undefined
}
interface ICardModalProps{
  card: ICard;
  canEdit: boolean;
}

const CardModal = ({card, canEdit}:ICardModalProps) => {
  // let wrapperRef = useRef<any>(null);

  const [t] = useTranslation();
  const [isDetailsVisible, setIsDetailVisible] = useState(false);
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
  const [memberships, setMemberships] = useState<IMembership[]>([]);
  const [labels, setLabels] = useState<ILabel[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  // const [actions, setActions] = useState<IAction[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [stopwatch, setStopwatch] = useState<IStopWatch>(defaultStopWatch);
  const [cookies] = useCookies(['UserId','UserName', 'AuthToken']);

  const {isLoading, data, isSuccess} = useQuery<any>(
    ["getInfoByCardId", card.cardId],
    ()=>apiGetInfosByCardId(card.cardId),
    {
      onSuccess: data => {
          console.log("[CardModal] Called Card Info");
          if(data[0].cardMembership) {
            setMemberships(data[0].cardMembership);
          };
          if(data[0].cardTask) {
            setTasks(data[0].cardTask);
          };
          if(data[0].dueDate) {
            setDueDate(data[0].dueDate);
          };
          if(data[0].stopwatch) {
            const stopwatch_input:IStopWatch = {
              total: data[0].stopwatch.total,
              startedAt: new Date(data[0].stopwatch.startedAt),
            }
            setStopwatch(stopwatch_input);
          };
          if(data[0].cardComment) {
            setComments(data[0].cardComment);
          };
          // if(data[0].cardAction) {
          //   setActions(data[0].cardAction);
          // };
      },
    //enabled : !showCreateModal
    }
  );

  const handleOnCloseCardModel = useCallback(()=>{
    setCurrentCard(defaultCard);
  }, [setCurrentCard]);

  const handleNameUpdate = useCallback((data:string) => {
    console.log("Udate name of card : ", data);
    const modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardName: data,
      cardActionType: 'UPDATE',
    }
    
    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to update name of card', result);
        const updatedCard = {
          ...card,
          cardName : data
        };
        setCurrentCard(updatedCard);
      })
      .catch((message)=>{
        console.log('Fail to update name of card', message);
      })
  }, [card, cookies, setCurrentCard]);

  const handleDescriptionUpdate = useCallback((data:string) => {
    console.log("Udate description of card : ", data);
    const modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardActionType: 'UPDATE',
      description: data,
    }
    
    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to update description of card', result);
        const updatedCard = {
          ...card,
          description : data
        };
        setCurrentCard(updatedCard);
      })
      .catch((message)=>{
        console.log('Fail to update description of card', message);
      })
  }, [card, cookies.UserId, setCurrentCard]);

  const handleTaskCreate = useCallback((data: string) =>{
    console.log("data of new task", data);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardTaskName: data,
      cardTaskPosition: "100000",
      cardTaskActionType: 'ADD',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result) =>{
        console.log("Succeeded to get response", result);
        if(result.outTaskId) {
          const newTask = {
            ...defaultTask,
            taskId : result.outTaskId,
            taskName : data,
          }
          const newTasks = tasks.concat(newTask);
          setTasks(newTasks);
        }
      })
      .catch((message)=>{
        console.log("Failed to get response", message);
      })
  }, [tasks, cookies.UserId, card.cardId]);

  const handleTaskUpdate = useCallback((id:string, data:any) => {
    console.log('handleTaskUpdate - ', data);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardTaskId: id,
      cardTaskActionType: 'UPDATE',
    }

    if(data.hasOwnProperty('taskName')) {
      console.log("Update task of card / name", data.taskName);
      modifiedCard.cardTaskName = data.taskName;
    }
    if(data.hasOwnProperty('isCompleted')) {
      console.log("Update task of card / isCompleted", data.isCompleted);
      modifiedCard.cardTaskIsCompleted = data.isCompleted ? "true" : "false";
    }
    
    //setUpdating(true);
    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to update task of card', result);
        const index = tasks.findIndex(task => task.taskId === id);

        console.log('found index : ', index);
        if(index < 0) return;

        let newTask = tasks[index];
        console.log('found task : ', newTask);

        if(data.hasOwnProperty('taskName')) {
          console.log('update task name : ', data.taskName);
          newTask.taskName = data.taskName;
        }
        if(data.hasOwnProperty('isCompleted')) {
          console.log('update task\'s isCompleted : ', data.isComplated);
          newTask.isCompleted = data.isCompleted;
        };

        const newTasks = [
          ...tasks.slice(0, index),
          newTask,
          ...tasks.slice(index+1) ];
        setTasks(newTasks);
      })
      .catch((message)=>{
        console.log('Fail to update task of card', message);
      })
  }, [tasks, cookies.UserId, card.cardId]);

  const handleTaskDelete = useCallback((id:string) => {
    console.log("Delete task of card / id : ", id);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardTaskId: id,
      cardTaskActionType: 'DELETE',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to delete task of card', result);
        const index = tasks.findIndex(task => task.taskId === id);
        console.log('found index : ', index);
        const newTasks = [
          ...tasks.slice(0, index),
          ...tasks.slice(index+1) ];
        setTasks(newTasks);
      })
      .catch((message)=>{
        console.log('Fail to delete task of card', message);
      })
      
  }, [tasks, cookies.UserId, card.cardId]);

  const handleCommentsCreate = useCallback((newText:string)=>{
    console.log("data of new comment", newText);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardCommentText: newText,
      cardCommentActionType: 'ADD',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result) =>{
        console.log("Succeeded to get response", result);
        if(result.outCommentId) {
          const newComment = {
            ...defaultComment,
            commentId: result.outActionId,
            cardId: card.cardId,
            userId: cookies.UserId,
            userName: cookies.UserName,
            text: newText,
            createdAt: result.outCommentCreatedAt,
          };
          const newComments = [newComment, ...comments];
          setComments(newComments);
        }
      })
      .catch((message)=>{
        console.log("Failed to get response", message);
      })
    }, [card.cardId, cookies, comments]);

  const handleCommentsUpdate = useCallback((id:string, newText:string)=>{
    console.log('handleActionUpdate - ', newText);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardCommentId: id,
      cardCommentText: newText,
      cardCommentActionType: 'UPDATE',
    }

    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to update comment of card', result);
        const index = comments.findIndex(comment => comment.commentId === id);

        if(index < 0) return;

        let newComment = comments[index];
        newComment.text = newText;
        newComment.updatedAt = result.outCommentUpdatedAt;

        const newComments = [
          ...comments.slice(0, index),
          newComment,
          ...comments.slice(index+1) ];
        setComments(newComments);
      })
      .catch((message)=>{
        console.log('Fail to update task of card', message);
      })
    }, [card.cardId, cookies.UserId, comments]);

  const handleCommentsDelete = useCallback((id:string)=>{
    console.log("Delete Comment - comment of card / id : ", id);
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardCommentId: id,
      cardCommentActionType: 'DELETE',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result)=>{
        console.log('Succeed to delete comment of card', result);
        const newComments = comments.filter(comment => comment.commentId !== id);
        setComments(newComments);
      })
      .catch((message)=>{
        console.log('Fail to delete task of card', message);
      })
  }, [card.cardId, cookies.UserId, comments]);

  const contentNode = (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={canEdit? 12 : 16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon name="list alternate outline" className={styles.moduleIcon} />
            <div className={styles.headerTitleWrapper}>
              {canEdit ? (
                <NameField defaultValue={card.cardName} onUpdate={handleNameUpdate} />
              ) : (
                <div className={styles.headerTitle}>{card.cardName}</div>
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={styles.modalPadding}>
        <Grid.Column width={canEdit? 12 : 16} className={styles.contentPadding}>
          {(memberships.length > 0 || labels.length > 0 || dueDate || stopwatch) && (
              <div className={styles.moduleWrapper}>
                {memberships.length > 0 && (
                  <div className={styles.attachments}>
                    <div className={styles.text}>
                      {t('common.membership', {
                        context: 'title',
                      })}
                    </div>
                    {memberships.map((membership) => (
                      <span key={membership.membershipId} className={styles.attachment}>
                        {/* {canEdit ? (
                          <BoardMembershipsPopup
                            items={allBoardMemberships}
                            currentUserIds={userIds}
                            onUserSelect={onUserAdd}
                            onUserDeselect={onUserRemove}
                          >
                            <User name={user.name} avatarUrl={user.avatarUrl} />
                          </BoardMembershipsPopup>
                        ) : (
                          <User name={user.name} avatarUrl={user.avatarUrl} />
                        )} */}
                        <User userName={membership.userName} avatarUrl={membership.avatarUrl}/>
                      </span>
                    ))}
                    {/* {canEdit && (
                      <BoardMembershipsPopup
                        items={allBoardMemberships}
                        currentUserIds={userIds}
                        onUserSelect={onUserAdd}
                        onUserDeselect={onUserRemove}
                      >
                        <button
                          type="button"
                          className={classNames(styles.attachment, styles.dueDate)}
                        >
                          <Icon name="add" size="small" className={styles.addAttachment} />
                        </button>
                      </BoardMembershipsPopup>
                    )} */}
                      <button
                        type="button"
                        className={classNames(styles.attachment, styles.dueDate)}
                      >
                        <Icon name="add" size="small" className={styles.addAttachment} />
                      </button>
                  </div>
                )}
                {/* {labels.length > 0 && (
                  <div className={styles.attachments}>
                    <div className={styles.text}>
                      {t('common.labels', {
                        context: 'title',
                      })}
                    </div>
                    {labels.map((label) => (
                      <span key={label.id} className={styles.attachment}>
                        {canEdit ? (
                          <LabelsPopup
                            key={label.id}
                            items={allLabels}
                            currentIds={labelIds}
                            onSelect={onLabelAdd}
                            onDeselect={onLabelRemove}
                            onCreate={onLabelCreate}
                            onUpdate={onLabelUpdate}
                            onMove={onLabelMove}
                            onDelete={onLabelDelete}
                          >
                            <Label name={label.name} color={label.color} />
                          </LabelsPopup>
                        ) : (
                          <Label name={label.name} color={label.color} />
                        )}
                      </span>
                    ))}
                    {canEdit && (
                      <LabelsPopup
                        items={allLabels}
                        currentIds={labelIds}
                        onSelect={onLabelAdd}
                        onDeselect={onLabelRemove}
                        onCreate={onLabelCreate}
                        onUpdate={onLabelUpdate}
                        onMove={onLabelMove}
                        onDelete={onLabelDelete}
                      >
                        <button
                          type="button"
                          className={classNames(styles.attachment, styles.dueDate)}
                        >
                          <Icon name="add" size="small" className={styles.addAttachment} />
                        </button>
                      </LabelsPopup>
                    )}
                  </div>
                    )}*/}
                {dueDate && (
                  <div className={styles.attachments}>
                    <div className={styles.text}>
                      {t('common.dueDate', {
                        context: 'title',
                      })}
                    </div>
                    <span className={styles.attachment}>
                      {/* {canEdit ? (
                        <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
                          <DueDate value={dueDate} />
                        </DueDateEditPopup>
                      ) : (
                        <DueDate value={dueDate} />
                      )} */}
                      <DueDate value={dueDate} />
                    </span>
                  </div>
                )}
                {stopwatch && (
                  <div className={styles.attachments}>
                    <div className={styles.text}>
                      {t('common.stopwatch', {
                        context: 'title',
                      })}
                    </div>
                    <span className={styles.attachment}>
                      {/* {canEdit ? (
                        <StopwatchEditPopup
                          defaultValue={stopwatch}
                          onUpdate={handleStopwatchUpdate}
                        >
                          <Stopwatch startedAt={stopwatch.startedAt} total={stopwatch.total} />
                        </StopwatchEditPopup>
                      ) : (
                        <Stopwatch startedAt={stopwatch.startedAt} total={stopwatch.total} />
                      )} */}
                      <Stopwatch startedAt={stopwatch.startedAt} total={stopwatch.total} />
                    </span>
                    {canEdit && (
                      <button
                        //onClick={handleToggleStopwatchClick}
                        type="button"
                        className={classNames(styles.attachment, styles.dueDate)}
                      >
                        <Icon
                          name={stopwatch.startedAt ? 'pause' : 'play'}
                          size="small"
                          className={styles.addAttachment}
                        />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          {(card.description || canEdit) && (
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="align justify" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.description')}</div>
                  {canEdit ? (
                    <DescriptionEdit defaultValue={card.description} onUpdate={handleDescriptionUpdate}>
                      {card.description ? (
                        <button
                          type="button"
                          className={classNames(styles.descriptionText, styles.cursorPointer)}
                        >
                          <Markdown linkStopPropagation linkTarget="_blank">
                            {card.description}
                          </Markdown>
                        </button>
                      ) : (
                        <button type="button" className={styles.descriptionButton}>
                          <span className={styles.descriptionButtonText}>
                            {t('action.addMoreDetailedDescription')}
                          </span>
                        </button>
                      )}
                    </DescriptionEdit>
                  ) : (
                    <div className={styles.descriptionText}>
                      <Markdown linkStopPropagation linkTarget="_blank">
                        {card.description}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
          )}
          {(tasks.length > 0 || canEdit) && (
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="check square outline" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.tasks')}</div>
                  <Tasks
                    items={tasks}
                    canEdit={canEdit}
                    onCreate={handleTaskCreate}
                    onUpdate={handleTaskUpdate}
                    //onMove={onTaskMove}
                    onDelete={handleTaskDelete}
                  />
                </div>
              </div>
          )}
          <Activities items={comments} isDetailsVisible={isDetailsVisible} canEdit={canEdit}
            onCreate={handleCommentsCreate}
            onUpdate={handleCommentsUpdate}
            onDelete={handleCommentsDelete}
          />
        </Grid.Column>
        {canEdit && (
          <Grid.Column width={4} className={styles.sidebarPadding}>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('action.addCard')}</span>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="user outline" className={styles.actionIcon} />
                    {t('common.membership')}
                  </Button>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="bookmark outline" className={styles.actionIcon} />
                    {t('common.labels')}
                  </Button>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="calendar check outline" className={styles.actionIcon} />
                    {t('common.dueDate', {
                      context: 'title',
                    })}
                  </Button>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="clock outline" className={styles.actionIcon} />
                    {t('common.stopwatch')}
                  </Button>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="attach" className={styles.actionIcon} />
                    {t('common.attachment')}
                  </Button>
            </div>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('common.actions')}</span>
                <Button
                  fluid
                  className={styles.actionButton}
                  //onClick={handleToggleSubscriptionClick}
                >
                  <Icon name="paper plane outline" className={styles.actionIcon} />
                  {/*isSubscribed ? t('action.unsubscribe') : */t('action.subscribe')}
                </Button>
                <Button
                    fluid
                    className={styles.actionButton}
                    //onClick={handleToggleSubscriptionClick}
                  >
                    <Icon name="share square outline" className={styles.actionIcon} />
                    {t('action.move')}
                  </Button>
                  <Button
                    fluid
                    className={styles.actionButton}
                    //onClick={handleToggleSubscriptionClick}
                  >
                    <Icon name="share square outline" className={styles.actionIcon} />
                    {t('action.delete')}
                  </Button>
            </div>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
  
  return (
    <Modal open closeIcon centered={false} className={styles.wrapper} onClose={handleOnCloseCardModel}>
      {contentNode}
    </Modal>
  );
};

export default CardModal;