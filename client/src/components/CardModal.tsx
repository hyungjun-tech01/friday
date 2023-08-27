import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal, TextArea } from 'semantic-ui-react';
import { ICard, atomCurrentCard, defaultCard } from '../atoms/atomCard';
import { ITask } from '../atoms/atomTask';
import { useSetRecoilState } from 'recoil';
import { useQuery } from "react-query";
import styles from "../scss/CardModal.module.scss";
import classNames from 'classnames';
import Activities from "./Activities";
import DescriptionEdit from "./DescriptionEdit";
import Tasks from "./Tasks"

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
  const [t] = useTranslation();
  const [isDetailsVisible, setIsDetailVisible] = useState(false);
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);

  let wrapperRef = useRef<any>(null);
  
  const [tasks, setTasks] = useState([]);

  const handleClickOutside = useCallback((event:any) => {
    if(wrapperRef
      && wrapperRef.current
      && !wrapperRef.current.contains(event.target)) {
        console.log("close CardModal");
        setCurrentCard(defaultCard);
    };
  }, []);

  const handleDescriptionUpdate = useCallback((data:string) => {
    console.log("Udate description of card : ", data);
  }, [])

  const handleTaskUpdate = useCallback((id:string, data:any) => {
    console.log("Udate task of card / id : ", id);
  }, [])

  const handleTaskDelete = useCallback((id:string) => {
    console.log("Delete task of card / id : ", id);
  }, [])

  useEffect(()=>{
    document.addEventListener('mousedown', handleClickOutside);
    return()=>{
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

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
        <Grid.Column width={16} className={styles.contentPadding}>
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
                          <TextArea linkStopPropagation linkTarget="_blank">
                            {card.description}
                          </TextArea>
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
                      <TextArea linkStopPropagation linkTarget="_blank">
                        {card.description}
                      </TextArea>
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
          <Activities isDetailsVisible={isDetailsVisible} canEdit={canEdit}/>
        </Grid.Column>
        {canEdit && (
          <Grid.Column width={4} className={styles.sidebarPadding}>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('action.addToCard')}</span>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 1"}
              </Button>
            </div>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('common.actions')}</span>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 2"}
              </Button>
            </div>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
  
  return (
    <div ref={wrapperRef}>
      <Modal open closeIcon centered={false}>
        {contentNode}
      </Modal>
    </div>
  );
};

export default CardModal;