import React, { ReactNode, useCallback, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { Menu, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import CardMembershipEditPopup from '../CardModal/CardMembershipEditPopup';
import LabelsEditPopup from '../LabelsEditPopup';
import DueDateEditPopup from '../DueDateEditPopup';
import StopwatchEditPopup from '../StopwatchEditPopup';
import CardMovePopup from '../CardMovePopup';
import DeletePopup from '../DeletePopup';
import {
  atomCurrentMyBoard,
  cardSelectorCardId,
  defaultModifyBoard,
  ICurrent,
  IModifyBoard,
} from '../../atoms/atomsBoard';
import {
  defaultModifyCard,
  ICard,
  ICardUser,
  IModifyCard,
} from '../../atoms/atomCard';
import { IStopwatch } from '../../atoms/atomStopwatch';
import { ILabel } from '../../atoms/atomLabel';
import { atomProjectsToLists } from '../../atoms/atomsProject';
import { BoardRepository } from '../../repository/boardRepo';
import { CardRepository } from '../../repository/cardRepo';
import { apiModifyBoard } from '../../api/board';
import { apiModifyCard } from '../../api/card';
import { getDateStringForDB } from '../../utils/date';
import styles from './CardEditPopup.module.scss';

const StepTypes = {
  USERS: 'USERS',
  LABELS: 'LABELS',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_STOPWATCH: 'EDIT_STOPWATCH',
  MOVE: 'MOVE',
  DELETE: 'DELETE',
};

interface ICardPathProps {
  projectId: string | null,
  boardId: string | null,
  listId: string | null,
};

interface ICardEditPopupProps {
  children: ReactNode;
  cardId: string;
  onNameEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

const CardEditPopup = ({
  cardId,
  onNameEdit,
  onDelete,
  onClose,
}: ICardEditPopupProps) => {
  const [t] = useTranslation();
  const [currentBoard, setCurrentBoard] = useRecoilState<ICurrent>(atomCurrentMyBoard);
  const [card, setCard] = useRecoilState<ICard>(cardSelectorCardId(cardId));
  const [step, setStep] = useState<string | null>(null);
  const [cardMembershipUserIds, setCardMembershipUserIds] = useState<string[]>([]);
  const [cardLabelsIds, setCardLabelsIds] = useState<string[]>([]);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  const projectsToLists = useRecoilValue(atomProjectsToLists);
  const [cardPath, setCardPath] = useState<ICardPathProps>({
    projectId: null, boardId: null, listId: null
  });
  const { createLabel, updateLabel, deleteLabel } =
    useRecoilValue(BoardRepository);
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
    moveCard,
    deleteCard,
  } = useRecoilValue(CardRepository);

  const handleBack = useCallback(() => {
    setStep(null);
  }, [setStep]);

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleUsersClick = useCallback(() => {
    setStep(StepTypes.USERS);
  }, [setStep]);

  const handleLabelsClick = useCallback(() => {
    setStep(StepTypes.LABELS);
  }, [setStep]);

  const handleEditDueDateClick = useCallback(() => {
    setStep(StepTypes.EDIT_DUE_DATE);
  }, [setStep]);

  const handleEditStopwatchClick = useCallback(() => {
    setStep(StepTypes.EDIT_STOPWATCH);
  }, [setStep]);

  const handleMoveClick = useCallback(() => {
    setStep(StepTypes.MOVE);
  }, [setStep]);

  const handleDeleteClick = useCallback(() => {
    setStep(StepTypes.DELETE);
  }, [setStep]);

  const handleCardDelete = useCallback(() => {
    onDelete();
    onClose();
  }, [onClose, onDelete]);

  //------------------Membership Functions------------------
  const handleUserAdd = useCallback(
    (id: string) => {
      addMembershipIntoCard(cookies.UserId, card.cardId, id).then((result) => {
        if (result) {
          const updatedMemberUserIds = [...cardMembershipUserIds, id];
          setCardMembershipUserIds(updatedMemberUserIds);
        }
      });
    },
    [currentBoard.users, card, cookies.UserId, cardMembershipUserIds, setCard]
  );
  const handleUserRemove = useCallback(
    (id: string) => {
      removeMembershipFromCard(cookies.UserId, card.cardId, id).then(
        (result) => {
          if (result) {
            const updatedMemberUserIds = cardMembershipUserIds.filter(
              (userId) => userId !== id
            );
            setCardMembershipUserIds(updatedMemberUserIds);
          }
        }
      );
    },
    [card, cookies.UserId, cardMembershipUserIds]
  );

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

  const handleLabelDelete = useCallback(
    (id: string) => {
      deleteLabel(id, cookies.UserId);
    },
    [card]
  );

  //------------------Card Functions------------------
  const handleCardMove = useCallback((newlistId: string) => {
    moveCard(cookies.UserId, card.cardId, newlistId);
  }, [currentBoard]);

  useEffect(() => {
    if (card.memberships) {
      const member_ids = card.memberships.map((member) => member.userId);
      setCardMembershipUserIds(member_ids);
    }
    if (card.labels) {
      const label_ids = card.labels.map((label) => label.labelId);
      setCardLabelsIds(label_ids);
    }
    if (card.boardId) {
      const foundProject = projectsToLists.filter((project) => {
        const foundBoard = project.boards.filter((board) => board.id === card.boardId);
        if(foundBoard.length > 0) return true;
        else return false;
      });
      if(foundProject) {
        const updateCardPath = {
          projectId: foundProject[0].id,
          boardId: card.boardId,
          listId: card.listId,
        };
        setCardPath(updateCardPath);
      };
    }
  }, [card, projectsToLists]);

  if (step) {
    switch (step) {
      case StepTypes.USERS:
        return (
          <CardMembershipEditPopup
            items={currentBoard.users}
            currentUserIds={cardMembershipUserIds}
            onUserSelect={handleUserAdd}
            onUserDeselect={handleUserRemove}
            onBack={handleBack}
          />
        );
      case StepTypes.LABELS:
        return (
          <LabelsEditPopup
            items={currentBoard.labels}
            canEdit={true}
            currentIds={cardLabelsIds}
            onSelect={handleLabelSelect}
            onDeselect={handleLabelUnselect}
            onCreate={handleLabelCreate}
            onUpdate={handleLabelUpdate}
            //onMove={onLabelMove}
            onDelete={handleLabelDelete}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT_DUE_DATE:
        return (
          <DueDateEditPopup
            defaultValue={card.dueDate ? new Date(card.dueDate) : null}
            onUpdate={handleDueDateUpdate}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT_STOPWATCH:
        return (
          <StopwatchEditPopup
            defaultValue={card.stopwatch}
            onUpdate={handleStopwatchUpdate}
            onBack={handleBack}
          />
        );
      case StepTypes.MOVE:
        return (
          <CardMovePopup
            defaultPath={cardPath}
            onMove={handleCardMove}
            // onTransfer={onTransfer}
            // onBoardFetch={onBoardFetch}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.DELETE:
        return (
          <DeletePopup
            title="common.deleteCard"
            content="common.areYouSureYouWantToDeleteThisCard"
            buttonContent="action.deleteCard"
            onConfirm={handleCardDelete}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <>
      <CustomPopupHeader>
        {t('common.cardActions', {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
            {t('action.editTitle', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleUsersClick}>
            {t('common.members', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleLabelsClick}>
            {t('common.labels', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            onClick={handleEditDueDateClick}
          >
            {t('action.editDueDate', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            onClick={handleEditStopwatchClick}
          >
            {t('action.editStopwatch', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleMoveClick}>
            {t('action.moveCard', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
            {t('action.deleteCard', {
              context: 'title',
            })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
};

export default CardEditPopup;
