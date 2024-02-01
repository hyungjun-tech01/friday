import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  apiDeleteAttatchment,
  apiModifyCard,
  apiUploadAttatchment,
} from '../../api/card';
import {
  ICard,
  atomCurrentCard,
  defaultCard,
  IModifyCard,
  defaultModifyCard,
  IAttachment,
  ICardUser,
  IImage,
} from '../../atoms/atomCard';
import {
  atomCurrentMyBoard,
  ICurrent,
  IModifyBoard,
  defaultModifyBoard,
  cardSelectorCardId,
} from '../../atoms/atomsBoard';
import { IStopwatch } from '../../atoms/atomStopwatch';
import { atomProjectsToLists } from '../../atoms/atomsProject';
import { CardRepository } from '../../repository/cardRepo';
import { SubscriptionRepository } from '../../repository/subscriptionRepo';
import Activities from './Activity/Activities';
import DescriptionEdit from '../DescriptionEdit';
import CardModalTasks from './CardModalTask/CardModalTasks';
import Markdown from '../Markdown';
import CardMembershipEditPopup from './CardMembershipEditPopup';
import NameField from '../NameField';
import User from '../User';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Stopwatch from '../Stopwatch';
import StopwatchEditPopup from '../StopwatchEditPopup';
import Label from '../Label';
import LabelsEditPopup from '../LabelsEditPopup';
import { Attachments, AttachmentAddPopup } from '../Attachment';
import CardMovePopup from '../CardMovePopup';

import { usePopup } from '../../lib/hook';
import classNames from 'classnames';
import styles from './CardModal.module.scss';
import { startStopwatch, stopStopwatch } from '../../utils/stopwatch';
import DeletePopup from '../DeletePopup';
import { BoardRepository } from '../../repository/boardRepo';

interface ICardPathProps {
  projectId: string | null;
  boardId: string | null;
  listId: string | null;
}

interface ICardModalProps {
  canEdit: boolean;
  onDelete: (id: string) => void;
}

const CardModal = ({ canEdit, onDelete }: ICardModalProps) => {
  const [t] = useTranslation();
  const [board, setBoard] = useRecoilState<ICurrent>(atomCurrentMyBoard);
  const [card, setCard] = useRecoilState<ICard>(atomCurrentCard);
  const [cardMembershipIds, setCardMembershipIds] = useState<string[]>([]);
  const [selectedLabelIds, setSeletedLabelIds] = useState<string[]>([]);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  const updateCard = useSetRecoilState(cardSelectorCardId(card.cardId));

  const projectsToLists = useRecoilValue(atomProjectsToLists);
  const [cardPath, setCardPath] = useState<ICardPathProps>({
    projectId: null,
    boardId: null,
    listId: null,
  });
  const {
    addMembershipIntoCard,
    removeMembershipFromCard,
    updateCardName,
    updateCardDescription,
    addLabelIntoCard,
    removeLabelFromCard,
    updateCardDueDate,
    updateCardStopwatch,
    createCardTask,
    updateCardTask,
    moveCardTask,
    deleteCardTask,
    createAttachment,
    updateAttachment,
    deleteAttachment,
    createComment,
    updateComment,
    deleteComment,
  } = useRecoilValue(CardRepository);
  const { createLabel, updateLabel, deleteLabel } =
    useRecoilValue(BoardRepository);
  const { addSubscription, removeSubscription, isSubscribed } = useRecoilValue(
    SubscriptionRepository
  );
  const [subscribed, setSubscribed] = useState(false);

  const isGalleryOpened = useRef(false);

  const CardMembershipEdit = usePopup(CardMembershipEditPopup);
  const LabelsEdit = usePopup(LabelsEditPopup);
  const DueDateEdit = usePopup(DueDateEditPopup);
  const StopwatchEdit = usePopup(StopwatchEditPopup);
  const AttachmentAdd = usePopup(AttachmentAddPopup);
  const CardMove = usePopup(CardMovePopup);
  const CardDelete = usePopup(DeletePopup);

  useEffect(() => {
    if (card.memberships) {
      const member_ids = card.memberships.map((member) => member.userId);
      setCardMembershipIds(member_ids);
    }
    if (card.labels) {
      const label_ids = card.labels.map((label) => label.labelId);
      setSeletedLabelIds(label_ids);
    }
    if (card.boardId) {
      const foundProject = projectsToLists.filter((project) => {
        const foundBoard = project.boards.filter(
          (board) => board.id === card.boardId
        );
        if (foundBoard.length > 0) return true;
        else return false;
      });
      if (foundProject) {
        const updateCardPath = {
          projectId: foundProject[0].id,
          boardId: card.boardId,
          listId: card.listId,
        };
        setCardPath(updateCardPath);
      }
    }
    const resp = isSubscribed(card.cardId);
    resp.then((res) => {
      setSubscribed(res);
    });
  }, [card, isSubscribed, projectsToLists]);

  const handleOnCloseCardModal = useCallback(() => {
    updateCard(card);
    setCard(defaultCard);
  }, [card, setCard, updateCard]);

  //------------------Membership Functions------------------
  const handleUserAdd = useCallback(
    (id: string) => {
      addMembershipIntoCard(cookies.UserId, card.cardId, id).then((result) => {
        if (result) {
          const updatedMemberUserIds = [...cardMembershipIds, id];
          setCardMembershipIds(updatedMemberUserIds);
        }
      });
    },
    [board.users, card, cookies.UserId, cardMembershipIds]
  );
  const handleUserRemove = useCallback(
    (id: string) => {
      removeMembershipFromCard(cookies.UserId, card.cardId, id).then(
        (result) => {
          if (result) {
            const updatedMemberUserIds = cardMembershipIds.filter(
              (userId) => userId !== id
            );
            setCardMembershipIds(updatedMemberUserIds);
          }
        }
      );
    },
    [card, cookies.UserId, cardMembershipIds]
  );

  //------------------Name Functions------------------
  const handleNameUpdate = useCallback(
    (data: string) => {
      updateCardName(card.cardId, cookies.UserId, data);
    },
    [card]
  );
  
  //------------------Description Functions------------------
  const handleDescriptionUpdate = useCallback(
    (data: string) => {
      updateCardDescription(card.cardId, cookies.UserId, data);
    },
    [card]
  );

  //------------------Label Functions------------------
  const handleLabelSelect = useCallback(
    (id: string) => {
      addLabelIntoCard(card.cardId, cookies.UserId, id);
    },
    [card]
  );
  const handleLabelUnselect = useCallback(
    (id: string) => {
      removeLabelFromCard(card.cardId, cookies.UserId, id);
    },
    [card]
  );
  const handleLabelCreate = useCallback(
    (data: { name: string | null; color: string }) => {
      createLabel(data, cookies.UserId);
    },
    []
  );
  const handleLabelUpdate = useCallback(
    (data: { id: string; name?: string; color?: string }) => {
      updateLabel(data, cookies.UserId);
    },
    []
  );
  const handleLabelDelete = useCallback((id: string) => {
    deleteLabel(id, cookies.UserId);
  }, []);

  //------------------Due Date Functions------------------
  const handleDueDateUpdate = useCallback(
    (date: Date | null) => {
      updateCardDueDate(card.cardId, cookies.UserId, date);
    },
    [card]
  );

  //------------------Stopwatch Functions------------------
  const handleStopwatchUpdate = useCallback(
    (stopwatch: IStopwatch | null) => {
      updateCardStopwatch(card.cardId, cookies.UserId, stopwatch);
    },
    [card]
  );
  const handleToggleStopwatchClick = useCallback(() => {
    if (card.stopwatch?.startedAt) {
      handleStopwatchUpdate(stopStopwatch(card.stopwatch));
    } else {
      handleStopwatchUpdate(startStopwatch(card.stopwatch));
    }
  }, [card.stopwatch, handleStopwatchUpdate]);

  //------------------Task Functions------------------
  const handleTaskCreate = useCallback(
    (data: string) => {
      createCardTask(card.cardId, cookies.UserId, data);
    },
    [card, cookies.UserId]
  );
  const handleTaskUpdate = useCallback(
    (id: string, data: any) => {
      updateCardTask(cookies.UserId, card.cardId, id, data);
    },
    [card, cookies.UserId]
  );
  const handleTaskMove = useCallback(
    (pick: string, idx: number) => {
      moveCardTask(pick, idx, cookies.UserId, card.cardId);
    },
    [card, cookies.UserId, setCard]
  );
  const handleTaskDelete = useCallback(
    (id: string) => {
      deleteCardTask(card.cardId, cookies.UserId, id);
    },
    [card]
  );

  //------------------Attachment Functions------------------
  const handleAttachmentCreate = useCallback(
    (file: any) => {
      createAttachment(card.cardId, cookies.UserId, cookies.UserName, file);
    },
    [card, cookies.UserId, cookies.UserName]
  );
  const handleAttachmentUpdate = useCallback(
    (id: string, data: any) => {
      // After server side update Process
      updateAttachment(cookies.UserId, card.cardId, id, data);
    },
    [card, cookies.UserId]
  );
  const handleAttachmentDelete = useCallback(
    async (id: string) => {
      // After server side delete Process
      deleteAttachment(cookies.UserId, card.cardId, id);
    },
    [card, cookies.UserId]
  );
  const handleCoverUpdate = useCallback(() => {}, []);
  const handleGalleryOpen = useCallback(() => {
    isGalleryOpened.current = true;
  }, []);
  const handleGalleryClose = useCallback(() => {
    isGalleryOpened.current = false;
  }, []);

  //------------------Comment Functions------------------
  const handleCommentsCreate = useCallback(
    (newText: string) => {
      createComment(cookies.UserId, cookies.UserName, card.cardId, newText);
    },
    [card, cookies.UserId, cookies.UserName]
  );
  const handleCommentsUpdate = useCallback(
    (id: string, newText: string) => {
      updateComment(cookies.UserId, card.cardId, id, newText);
    },
    [card, cookies.UserId]
  );
  const handleCommentsDelete = useCallback(
    (id: string) => {
      deleteComment(cookies.UserId, card.cardId, id);
    },
    [card, cookies.UserId]
  );

  //------------------Card Functions------------------
  const handleCardMove = useCallback(
    (newlistId: string) => {
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        userId: cookies.UserId,
        cardId: card.cardId,
        listId: newlistId,
        cardActionType: 'MOVE',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to move card', result.message);
          } else {
            const found_list_idx = board.lists.findIndex(
              (list) => list.listId === newlistId
            );
            if (found_list_idx === -1) {
              const found_card_idx = board.cards.findIndex(
                (cardInBoard) => cardInBoard.cardId === card.cardId
              );
              if (found_card_idx !== -1) {
                const updateCards = [
                  ...board.cards.slice(0, found_card_idx),
                  ...board.cards.slice(found_card_idx + 1),
                ];
                const updateCurrentBoard = {
                  ...board,
                  cards: updateCards,
                };
                setBoard(updateCurrentBoard);
              }
            } else {
              const found_card_idx = board.cards.findIndex(
                (cardInBoard) => cardInBoard.cardId === card.cardId
              );
              if (found_card_idx !== -1) {
                const updateCard = {
                  ...board.cards[found_card_idx],
                  listId: newlistId,
                };
                const updateCards = [
                  ...board.cards.slice(0, found_card_idx),
                  updateCard,
                  ...board.cards.slice(found_card_idx + 1),
                ];
                const updateCurrentBoard = {
                  ...board,
                  cards: updateCards,
                };
                setBoard(updateCurrentBoard);
              }
            }
          }
          handleOnCloseCardModal();
        })
        .catch((message) => {
          console.log('Fail to move card', message);
        });
    },
    [board, card.cardId, cookies.UserId, handleOnCloseCardModal, setBoard]
  );
  const handleCardDelete = useCallback(() => {
    onDelete(card.cardId);
    setCard(defaultCard);
  }, [card.cardId, onDelete, setCard]);
  const handleSubscribeClick = useCallback(() => {
    if (subscribed) {
      removeSubscription(card.cardId, cookies.UserId);
    } else {
      addSubscription(card.cardId, cookies.UserId);
    }
    setSubscribed(!subscribed);
  }, [
    addSubscription,
    card.cardId,
    cookies.UserId,
    removeSubscription,
    subscribed,
  ]);

  const contentNode = (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={canEdit ? 12 : 16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon name="list alternate outline" className={styles.moduleIcon} />
            <div className={styles.headerTitleWrapper}>
              {canEdit ? (
                <NameField
                  defaultValue={card.cardName}
                  size="Normal"
                  onUpdate={handleNameUpdate}
                />
              ) : (
                <div className={styles.headerTitle}>{card.cardName}</div>
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={styles.modalPadding}>
        <Grid.Column
          width={canEdit ? 12 : 16}
          className={styles.contentPadding}
        >
          {(card.memberships.length > 0 ||
            card.labels.length > 0 ||
            card.dueDate ||
            card.stopwatch) && (
            <div className={styles.moduleWrapper}>
              {card.memberships.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.members', {
                      context: 'title',
                    })}
                  </div>
                  {card.memberships.map((user) => (
                    <span
                      key={user.cardMembershipId}
                      className={styles.attachment}
                    >
                      {canEdit ? (
                        <CardMembershipEdit
                          items={board.users}
                          currentUserIds={cardMembershipIds}
                          onUserSelect={handleUserAdd}
                          onUserDeselect={handleUserRemove}
                        >
                          <User
                            userName={user.userName}
                            avatarUrl={user.avatarUrl}
                          />
                        </CardMembershipEdit>
                      ) : (
                        <User
                          userName={user.userName}
                          avatarUrl={user.avatarUrl}
                        />
                      )}
                    </span>
                  ))}
                  {canEdit && (
                    <CardMembershipEdit
                      items={board.users}
                      currentUserIds={cardMembershipIds}
                      onUserSelect={handleUserAdd}
                      onUserDeselect={handleUserRemove}
                    >
                      <button
                        type="button"
                        className={classNames(
                          styles.attachment,
                          styles.dueDate
                        )}
                      >
                        <Icon
                          name="add"
                          size="small"
                          className={styles.addAttachment}
                        />
                      </button>
                    </CardMembershipEdit>
                  )}
                </div>
              )}
              {card.labels.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.labels', {
                      context: 'title',
                    })}
                  </div>
                  {card.labels.map((label) => (
                    <span key={label.labelId} className={styles.attachment}>
                      {canEdit ? (
                        <LabelsEdit
                          key={label.labelId}
                          items={board.labels}
                          canEdit={canEdit}
                          currentIds={selectedLabelIds}
                          onSelect={handleLabelSelect}
                          onDeselect={handleLabelUnselect}
                          onCreate={handleLabelCreate}
                          onUpdate={handleLabelUpdate}
                          // onMove={onLabelMove}
                          onDelete={handleLabelDelete}
                        >
                          <Label name={label.labelName} color={label.color} />
                        </LabelsEdit>
                      ) : (
                        <Label name={label.labelName} color={label.color} />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {card.dueDate && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.dueDate', {
                      context: 'title',
                    })}
                  </div>
                  <span className={styles.attachment}>
                    {canEdit ? (
                      <DueDateEdit
                        defaultValue={new Date(card.dueDate)}
                        onUpdate={handleDueDateUpdate}
                      >
                        <DueDate value={new Date(card.dueDate)} />
                      </DueDateEdit>
                    ) : (
                      <DueDate value={new Date(card.dueDate)} />
                    )}
                  </span>
                </div>
              )}
              {card.stopwatch && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.stopwatch', {
                      context: 'title',
                    })}
                  </div>
                  <span className={styles.attachment}>
                    {canEdit ? (
                      <StopwatchEdit
                        defaultValue={card.stopwatch}
                        onUpdate={handleStopwatchUpdate}
                      >
                        <Stopwatch
                          startedAt={card.stopwatch.startedAt}
                          total={card.stopwatch.total}
                        />
                      </StopwatchEdit>
                    ) : (
                      <Stopwatch
                        startedAt={card.stopwatch.startedAt}
                        total={card.stopwatch.total}
                      />
                    )}
                  </span>
                  {canEdit && (
                    <button
                      onClick={handleToggleStopwatchClick}
                      type="button"
                      className={classNames(styles.attachment, styles.dueDate)}
                    >
                      <Icon
                        name={card.stopwatch.startedAt ? 'pause' : 'play'}
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
                <div className={styles.moduleHeader}>
                  {t('common.description')}
                </div>
                {canEdit ? (
                  <DescriptionEdit
                    defaultValue={card.description}
                    onUpdate={handleDescriptionUpdate}
                  >
                    {card.description ? (
                      <button
                        type="button"
                        className={classNames(
                          styles.descriptionText,
                          styles.cursorPointer
                        )}
                      >
                        <Markdown linkStopPropagation linkTarget="_blank">
                          {card.description}
                        </Markdown>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.descriptionButton}
                      >
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
          {(card.tasks.length > 0 || canEdit) && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon
                  name="check square outline"
                  className={styles.moduleIcon}
                />
                <div className={styles.moduleHeader}>{t('common.tasks')}</div>
                <CardModalTasks
                  items={card.tasks}
                  canEdit={canEdit}
                  onCreate={handleTaskCreate}
                  onUpdate={handleTaskUpdate}
                  onMove={handleTaskMove}
                  onDelete={handleTaskDelete}
                />
              </div>
            </div>
          )}
          {card.attachments.length > 0 && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="attach" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.attachments')}
                </div>
                <Attachments
                  items={card.attachments}
                  canEdit={canEdit}
                  onUpdate={handleAttachmentUpdate}
                  onDelete={handleAttachmentDelete}
                  onCoverUpdate={handleCoverUpdate}
                  onGalleryOpen={handleGalleryOpen}
                  onGalleryClose={handleGalleryClose}
                />
              </div>
            </div>
          )}
          <Activities
            items={card.comments}
            //isDetailsVisible={isDetailsVisible}
            canEdit={canEdit}
            onCreate={handleCommentsCreate}
            onUpdate={handleCommentsUpdate}
            onDelete={handleCommentsDelete}
          />
        </Grid.Column>
        {canEdit && (
          <Grid.Column width={4} className={styles.sidebarPadding}>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('action.addCard')}</span>
              <CardMembershipEdit
                items={board.users}
                currentUserIds={cardMembershipIds}
                onUserSelect={handleUserAdd}
                onUserDeselect={handleUserRemove}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon name="user outline" className={styles.actionIcon} />
                  {t('common.members')}
                </Button>
              </CardMembershipEdit>
              <LabelsEdit
                items={board.labels}
                canEdit={canEdit}
                currentIds={selectedLabelIds}
                onSelect={handleLabelSelect}
                onDeselect={handleLabelUnselect}
                onCreate={handleLabelCreate}
                onUpdate={handleLabelUpdate}
                // onMove={onLabelMove}
                onDelete={handleLabelDelete}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon name="bookmark outline" className={styles.actionIcon} />
                  {t('common.labels')}
                </Button>
              </LabelsEdit>
              <DueDateEdit
                defaultValue={card.dueDate ? new Date(card.dueDate) : null}
                onUpdate={handleDueDateUpdate}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon
                    name="calendar check outline"
                    className={styles.actionIcon}
                  />
                  {t('common.dueDate', {
                    context: 'title',
                  })}
                </Button>
              </DueDateEdit>
              <StopwatchEdit
                defaultValue={card.stopwatch}
                onUpdate={handleStopwatchUpdate}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon name="clock outline" className={styles.actionIcon} />
                  {t('common.stopwatch')}
                </Button>
              </StopwatchEdit>
              <AttachmentAdd onCreate={handleAttachmentCreate}>
                <Button fluid className={styles.actionButton}>
                  <Icon name="attach" className={styles.actionIcon} />
                  {t('common.attachment')}
                </Button>
              </AttachmentAdd>
            </div>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('common.actions')}</span>
              <Button
                fluid
                className={styles.actionButton}
                onClick={handleSubscribeClick}
              >
                <Icon
                  name="share square outline"
                  className={styles.actionIcon}
                />
                {subscribed ? t('action.unsubscribe') : t('action.subscribe')}
              </Button>
              <CardMove defaultPath={cardPath} onMove={handleCardMove}>
                <Button fluid className={styles.actionButton}>
                  <Icon
                    name="share square outline"
                    className={styles.actionIcon}
                  />
                  {t('action.move')}
                </Button>
              </CardMove>
              <CardDelete
                title="common.deleteCard"
                content="common.areYouSureYouWantToDeleteThisCard"
                buttonContent="action.deleteCard"
                onConfirm={handleCardDelete}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon
                    name="share square outline"
                    className={styles.actionIcon}
                  />
                  {t('action.delete')}
                </Button>
              </CardDelete>
            </div>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  );

  return (
    <Modal
      open
      closeIcon
      centered={false}
      className={styles.wrapper}
      onClose={handleOnCloseCardModal}
    >
      {contentNode}
    </Modal>
  );
};

export default CardModal;
