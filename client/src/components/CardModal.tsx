import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { ICard, atomCurrentCard, defaultCard } from '../atoms/atomCard';
import styles from "../scss/CardModal.module.scss";
import Activities from "./Activities";
import { useSetRecoilState } from 'recoil';

interface ICardModalProps{
    card: ICard;
    canEdit: boolean;
    // users: any[];
    // labels: any[];
    // dueDate: string;
    // stopwatch: string;
    // tasks: any[];
    // description: string;
    isOpened: boolean;
}

const CardModal = ({card, canEdit, isOpened}:ICardModalProps) => {
  const [t] = useTranslation();
  const [isDetailsVisible, setIsDetailVisible] = useState(false);
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);

  let wrapperRef = useRef<any>(null);

  const handleClickOutside = useCallback((event:any) => {
    if(wrapperRef
      && wrapperRef.current
      && !wrapperRef.current.contains(event.target)) {
      setCurrentCard(defaultCard);
    };
  }, []);

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
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 2"}
              </Button>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 3"}
              </Button>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 4"}
              </Button>
            </div>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('common.actions')}</span>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 5"}
              </Button>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 6"}
              </Button>
              <Button
                fluid
                className={styles.actionButton}
              >
                <Icon name="paper plane outline" className={styles.actionIcon} />
                {"Action 7"}
              </Button>
            </div>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );
  
  return (
    <div ref={wrapperRef}>
      <Modal open={isOpened} closeIcon centered={false}>
        {contentNode}
      </Modal>
    </div>
  );
};

export default CardModal;