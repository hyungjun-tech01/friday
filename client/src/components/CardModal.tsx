import { useState, useCallback, useRef, useEffect,  } from 'react';
import { useCookies } from 'react-cookie'
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Item, Modal } from 'semantic-ui-react';
import { ICard, atomCurrentCard, defaultCard, IModifyCard, defaultModifyCard } from '../atoms/atomCard';
import { ITask } from '../atoms/atomTask';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from "react-query";
import styles from "../scss/CardModal.module.scss";
import classNames from 'classnames';
import Activities from "./Activities";
import DescriptionEdit from "./DescriptionEdit";
import Tasks from "./Tasks"
import Markdown from './Markdown';
import { apiGetInfosByCardId, apiModifyCard } from "../api/card"
import { IAction } from "../atoms/atomAction"
import { atomCurrentTasks } from "../atoms/atomTask"
import { values } from 'lodash';

interface ICardModalProps{
  card: ICard;
  canEdit: boolean;
  // users: any[];
  // labels: any[];
  // dueDate: string;
  // stopwatch: string;
  // tasks: any[];
}

const CardModal = ({card, canEdit}:ICardModalProps) => {
  // let wrapperRef = useRef<any>(null);

  const [t] = useTranslation();
  const [isDetailsVisible, setIsDetailVisible] = useState(false);
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [actions, setActions] = useState<IAction[]>([]);
  const [updating, setUpdating] = useState(false);
  const [cookies] = useCookies(['UserId','UserName', 'AuthToken']);

  const {isLoading, data, isSuccess} = useQuery<any>(
    ["getInfoByCardId", card.cardId],
    ()=>apiGetInfosByCardId(card.cardId),
    {
      onSuccess: data => {
          console.log("[CardModal] Called Card Info");
          if(data[0].cardTask) {
            setTasks(data[0].cardTask);
          };
          if(data[0].cardAction) {
            setActions(data[0].cardAction);
          }
      },
    //enabled : !showCreateModal
    }
  );

  const handleOnCloseCardModel = useCallback(()=>{
    setCurrentCard(defaultCard);
  }, [])

  const handleDescriptionUpdate = useCallback((data:string) => {
    console.log("Udate description of card : ", data);
    const modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardActionType: 'UPDATE',
      description: data,
    }
    //setUpdating(true);
    const response = apiModifyCard(modifiedCard);
    if(response) {
      console.log('Succeed to update description of card', response);
      const updatedCard = {
        ...card,
        description : data
      };
      setCurrentCard(updatedCard);
      //setUpdating(false);
    }
  }, [])

  const handleTaskUpdate = useCallback((id:string, data:any) => {
    let taskProp = "";
    let modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardTaskId: id,
      cardActionType: 'UPDATE',
    }

    if(data.hasOwnProperty('name')) {
      console.log("Update task of card / name", data.name);
      taskProp="name";
      modifiedCard.cardTaskName = data.name;
    }
    else if(data.hasOwnProperty('isCompleted')) {
      console.log("Update task of card / isCompleted", data.isCompleted);
      taskProp="isCompleted";
      modifiedCard.cardTaskIsCompleted = data.isCompleted ? "true" : "false";
    }
    
    //setUpdating(true);
    const response = apiModifyCard(modifiedCard);
    if(response) {
      console.log('Succeed to update task of card', response);
      const index = tasks.findIndex(task => task.taskId === id);
      console.log('found index : ', index);
      let newTask = tasks[index];
      console.log('found task : ', newTask);
      if(taskProp === "name") {
        newTask.taskName = data.name;
      }
      else if(taskProp === "isCompleted") {
        newTask.isCompleted = data.isCompleted;
      }

      const newTasks = [
        ...tasks.slice(0, index),
        newTask,
        ...tasks.slice(index+1) ];
      setTasks(newTasks);
    }
  }, []);

  const handleTaskDelete = useCallback((id:string) => {
    console.log("Delete task of card / id : ", id);
  }, [])

  const contentNode = (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={canEdit? 12 : 16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon name="list alternate outline" className={styles.moduleIcon} />
            <div className={styles.headerTitleWrapper}>
                <div className={styles.headerTitle}>{card.cardName}</div>
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={styles.modalPadding}>
        <Grid.Column width={canEdit? 12 : 16} className={styles.contentPadding}>
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
                    //onCreate={onTaskCreate}
                    onUpdate={handleTaskUpdate}
                    //onMove={onTaskMove}
                    onDelete={handleTaskDelete}
                  />
                </div>
              </div>
          )}
          <Activities items={actions} isDetailsVisible={isDetailsVisible} canEdit={canEdit}/>
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