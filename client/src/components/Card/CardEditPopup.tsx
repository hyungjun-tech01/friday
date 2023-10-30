import React, { ReactNode, useCallback, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { Menu, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import CardMembershipEditPopup from '../CardMembershipEditPopup';
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
  const [cardUserIds, setCardUserIds] = useState<string[]>([]);
  const [cardLabelsIds, setCardLabelsIds] = useState<string[]>([]);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  const projectsToLists = useRecoilValue(atomProjectsToLists);
  const [cardPath, setCardPath] = useState<ICardPathProps>({
    projectId: null, boardId: null, listId: null
  });

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
      console.log('handleUserAdd : ', id);
      const addUser = currentBoard.users.filter((user) => user.userId === id).at(0);
      if (addUser) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardMembershipActionType: 'ADD',
          cardMembershipUserId: id,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log(
                'Fail to update add membership of card',
                result.message
              );
            } else {
              console.log('Succeed to add new membership', result);
              const newMembership: ICardUser = {
                cardMembershipId: result.outCardMembershipId,
                cardId: card.cardId,
                userId: addUser.userId,
                createdAt: result.outCreatedAt ? result.outCreatedAt : null,
                updatedAt: null,
                email: addUser.userEmail,
                userName: addUser.userName,
                avatarUrl: addUser.avatarUrl,
              };
              const newCardMembership = card.memberships.concat(newMembership);
              const newCardUserIds = cardUserIds.concat(id);
              setCardUserIds(newCardUserIds);

              const updateCard = {
                ...card,
                memberships: newCardMembership,
              };
              setCard(updateCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [currentBoard.users, card, cookies.UserId, cardUserIds, setCard]
  );

  const handleUserRemove = useCallback(
    (id: string) => {
      const deleteMember = card.memberships
        .filter((user) => user.userId === id)
        .at(0);
      if (deleteMember) {
        console.log('handleUserRemove : ', id);
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardMembershipActionType: 'DELETE',
          cardMembershipId: deleteMember.cardMembershipId,
          cardMembershipUserId: deleteMember.userId,
        };
        console.log(modifiedCard);
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log(
                'Fail to update delete membership of card',
                result.message
              );
            } else {
              console.log('Succeed to delete membership', result);
              const member_index = card.memberships.findIndex(
                (membership) => membership.userId === id
              );
              const newCardMembership = [
                ...card.memberships.slice(0, member_index),
                ...card.memberships.slice(member_index + 1),
              ];
              const userId_index = cardUserIds.findIndex(
                (userId) => userId === id
              );
              const newCardUserIds = [
                ...cardUserIds.slice(0, userId_index),
                ...cardUserIds.slice(userId_index + 1),
              ];
              setCardUserIds(newCardUserIds);

              const updateCard = {
                ...card,
                memberships: newCardMembership,
              };
              setCard(updateCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId, cardUserIds, setCard]
  );

  //------------------Due Date Functions------------------
  const handleDueDateUpdate = useCallback(
    (date: Date | null) => {
      const date_string = getDateStringForDB(date);

      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardActionType: 'UPDATE',
        dueDate: date_string,
      };

      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update due date of card', result.message);
          } else {
            console.log('Succeed to update due date of card', result);
            const updatedCard = {
              ...card,
              dueDate: date ? date_string : null,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update due date of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  //------------------Stopwatch Functions------------------
  const handleStopwatchUpdate = useCallback(
    (stopwatch: IStopwatch | null) => {
      const newStopwatch: IStopwatch = {
        total: stopwatch ? stopwatch.total : -1,
        startedAt: stopwatch
          ? stopwatch.startedAt
            ? stopwatch.startedAt
            : null
          : null,
      };
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardActionType: 'UPDATE',
        stopwatch: newStopwatch,
      };
      console.log('check value : ', modifiedCard.stopwatch);
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update stopwatch of card', result.message);
          } else {
            console.log('Succeed to update stopwatch of card', result);

            const updatedCard = {
              ...card,
              stopwatch: stopwatch ? newStopwatch : null,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update stopwatch of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  //------------------Label Functions------------------
  const handleLabelSelect = useCallback(
    (id: string) => {
      console.log('Select Label');
      const found_label = currentBoard.labels
        .filter((label) => label.labelId === id)
        .at(0);
      if (found_label) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardLabelActionType: 'ADD',
          labelId: id,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log('Fail to update label selection', result.message);
            } else {
              console.log('Succeed to update label selection', result);
              const newLabels = card.labels.concat(found_label);
              const updatedCard: ICard = {
                ...card,
                labels: newLabels,
              };
              setCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId, currentBoard.labels, setCard]
  );

  const handleLabelUnselect = useCallback(
    (id: string) => {
      console.log('Unselect Label');
      const found_index = card.labels.findIndex(
        (label) => label.labelId === id
      );
      if (found_index !== -1) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardLabelActionType: 'DELETE',
          labelId: id,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log('Fail to update label selection', result.message);
            } else {
              console.log('Succeed to update label selection', result);
              const newLabels = [
                ...card.labels.slice(0, found_index),
                ...card.labels.slice(found_index + 1),
              ];
              const updatedCard: ICard = {
                ...card,
                labels: newLabels,
              };
              setCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId, setCard]
  );

  const handleLabelCreate = useCallback(
    (data: { name: string | null; color: string }) => {
      console.log('Label Create');
      const modifiedBoard: IModifyBoard = {
        ...defaultModifyBoard,
        boardId: currentBoard.boardId,
        userId: cookies.UserId,
        boardLabelActionType: 'ADD',
        labelName: data.name,
        labelColor: data.color,
      };
      const response = apiModifyBoard(modifiedBoard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to add label', result.message);
          } else {
            console.log('Succeed to add label', result);
            const newLabel: ILabel = {
              boardId: currentBoard.boardId,
              labelId: result.outLabelId,
              labelName: data.name ? data.name : '',
              color: data.color,
              position: '',
            };
            const newLabels = card.labels.concat(newLabel);
            const updatedCard = {
              ...card,
              labels: newLabels,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to add label', message);
        });
    },
    [currentBoard.boardId, card, cookies.UserId, setCard]
  );

  const handleLabelUpdate = useCallback(
    (data: { id: string; name?: string; color?: string }) => {
      const found_index = card.labels.findIndex(
        (label) => label.labelId === data.id
      );
      if (found_index !== -1) {
        const modifiedBoard: IModifyBoard = {
          ...defaultModifyBoard,
          boardId: currentBoard.boardId,
          userId: cookies.UserId,
          boardLabelActionType: 'UPDATE',
          labelId: data.id,
          labelName: data.name ? data.name : null,
          labelColor: data.color ? data.color : null,
        };
        const response = apiModifyBoard(modifiedBoard);
        response
          .then((result) => {
            if (result.message) {
              console.log('Fail to update label', result.message);
            } else {
              console.log('Succeed to update label', result);
              let newLabel = card.labels[found_index];
              if (data.name) newLabel.labelName = data.name;
              if (data.color) newLabel.color = data.color;
              const newLabels = [
                ...card.labels.slice(0, found_index),
                newLabel,
                ...card.labels.slice(found_index + 1),
              ];
              const updatedCard = {
                ...card,
                labels: newLabels,
              };
              setCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update label', message);
          });
      }
    },
    [currentBoard.boardId, card, cookies.UserId, setCard]
  );

  const handleLabelDelete = useCallback(
    (id: string) => {
      console.log('Label Delete');
      const modifiedBoard: IModifyBoard = {
        ...defaultModifyBoard,
        boardId: currentBoard.boardId,
        userId: cookies.UserId,
        boardLabelActionType: 'DELETE',
        labelId: id,
      };
      const response = apiModifyBoard(modifiedBoard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to delete label', result.message);
          } else {
            console.log('Succeed to delete label', result);
            const found_index = card.labels.findIndex(
              (label) => label.labelId === id
            );
            const newLabels = [
              ...card.labels.slice(0, found_index),
              ...card.labels.slice(found_index + 1),
            ];
            const updatedCard = {
              ...card,
              labels: newLabels,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to delete label', message);
        });
    },
    [currentBoard.boardId, card, cookies.UserId, setCard]
  );

  //------------------Card Functions------------------
  const handleCardMove = useCallback((newlistId: string) => {
    const modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      userId: cookies.UserId,
      cardId : cardId,
      listId : newlistId,
      cardActionType: 'MOVE',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result) => {
        if (result.message) {
          console.log(
            'Fail to move card',
            result.message
          );
        } else {
          console.log('Succeed to move card', result);
          const found_list_idx = currentBoard.lists.findIndex((list) => list.listId === newlistId);
          if(found_list_idx === -1) {
            const found_card_idx = currentBoard.cards.findIndex((card) => card.cardId === cardId);
            if(found_card_idx !== -1) {
              const updateCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                ...currentBoard.cards.slice(found_card_idx + 1)
              ];
              const updateCurrentBoard = {
                ...currentBoard,
                cards : updateCards
              };
              setCurrentBoard(updateCurrentBoard);
            }
          }
          else {
            const found_card_idx = currentBoard.cards.findIndex((card) => card.cardId === cardId);
            if(found_card_idx !== -1) {
              const updateCard = {
                ...currentBoard.cards[found_card_idx],
                listId: newlistId
              };
              const updateCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                updateCard,
                ...currentBoard.cards.slice(found_card_idx + 1)
              ];
              const updateCurrentBoard = {
                ...currentBoard,
                cards: updateCards
              };
              setCurrentBoard(updateCurrentBoard);
            };
          };
        };
      })
      .catch((message) => {
        console.log('Fail to move card', message);
      });
  }, [currentBoard]);

  useEffect(() => {
    console.log('CardEditPopup -');

    if (card.memberships) {
      const member_ids = card.memberships.map((member) => member.userId);
      setCardUserIds(member_ids);
    }
    if (card.labels) {
      const label_ids = card.labels.map((label) => label.labelId);
      setCardLabelsIds(label_ids);
    }
    if (card.boardId) {
      console.log("projectsToLists - ", projectsToLists);
      const foundProject = projectsToLists.filter((project) => {
        const foundBoard = project.boards.filter((board) => board.id === card.boardId);
        if(foundBoard.length > 0) return true;
        else return false;
      });
      if(foundProject) {
        console.log("foundProject - ", foundProject);
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
        console.log('CardEditPopup - USERS Step', step);
        return (
          <CardMembershipEditPopup
            items={currentBoard.users}
            currentUserIds={cardUserIds}
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
  }

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
