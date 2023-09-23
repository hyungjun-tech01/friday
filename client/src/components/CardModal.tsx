import { useState, useCallback, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { apiModifyBoard } from '../api/board';
import { apiGetInfosByCardId, apiModifyCard } from '../api/card';
import { IComment, defaultComment } from '../atoms/atomAction';
import {
  ICard,
  atomCurrentCard,
  defaultCard,
  IModifyCard,
  defaultModifyCard,
} from '../atoms/atomCard';
import {
  atomCurrentMyBoard,
  ICurrent,
  IModifyBoard,
  defaultModifyBoard,
} from '../atoms/atomsBoard';
import { ITask, defaultTask } from '../atoms/atomTask';
import { IMembership } from '../atoms/atomsUser';
import { IStopwatch } from '../atoms/atomStopwatch';
import { ILabel } from '../atoms/atomLabel';
import Activities from './Activities';
import DescriptionEdit from './DescriptionEdit';
import Tasks from './Tasks';
import Markdown from './Markdown';
import CardMembershipPopup from './CardMembershipPopup';
import NameField from './NameField';
import User from './User';
import DueDate from './DueDate';
import DueDateEdit from './DueDateEdit';
import Stopwatch from './Stopwatch';
import StopwatchEdit from './StopwatchEdit';
import Label from './Label';
import LabelsPopup from './LabelsPopup';

import classNames from 'classnames';
import styles from '../scss/CardModal.module.scss';
import { startStopwatch, stopStopwatch } from '../utils/stopwatch';

interface ICardModalProps {
  canEdit: boolean;
}

const CardModal = ({ canEdit }: ICardModalProps) => {
  // let wrapperRef = useRef<any>(null);
  const [t] = useTranslation();
  const [board, setBoard] = useRecoilState<ICurrent>(atomCurrentMyBoard);
  const [currentCard, setCurrentCard] = useRecoilState<ICard>(atomCurrentCard);
  const [cardMemberships, setCardMemberships] = useState<IMembership[]>([]);
  const [cardUserIds, setCardUserIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  // const [actions, setActions] = useState<IAction[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stopwatch, setStopwatch] = useState<IStopwatch | null>(null);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);

  const { isLoading, data, isSuccess } = useQuery<any>(
    ['getInfoByCardId', currentCard.cardId],
    () => apiGetInfosByCardId(currentCard.cardId),
    {
      onSuccess: (data) => {
        console.log('[CardModal] Called Card Info : ', data);
        if (data[0].cardMembership) {
          const newCardMembership:IMembership[] = [
            ...data[0].cardMembership
          ];
          setCardMemberships(newCardMembership);
          setCardUserIds(newCardMembership.map((user) => user.userId));
        }
        if (data[0].cardTask) {
          const newTasks = [
            ...data[0].cardTask
          ];
          setTasks(newTasks);
        }
        if (data[0].dueDate) {
          const date = new Date(data[0].dueDate);
          setDueDate(date);
        }
        if (data[0].stopwatch) {
          const stopwatch_input: IStopwatch = {
            total: parseInt(data[0].stopwatch.total),
            startedAt: new Date(data[0].stopwatch.startedAt),
          };
          setStopwatch(stopwatch_input);
        }
        if (data[0].cardComment) {
          const newCardComment = [
            ...data[0].cardComment
          ];
          setComments(newCardComment);
        }
        // if(data[0].cardAction) {
        //   setActions(data[0].cardAction);
        // };
        console.log('[CardModal] Check : ', cardMemberships);
      },
      refetchOnWindowFocus: false,
      enabled : !!currentCard
    }
  );

  const handleOnCloseCardModel = useCallback(() => {
    setCurrentCard(defaultCard);
  }, [setCurrentCard]);

  //------------------Membership Functions------------------
  const handleUserAdd = useCallback(
    (id: string) => {
      console.log('handleUserAdd : ', id);
      const addUser = board.users.filter((user) => user.userId === id).at(0);
      if (addUser) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: currentCard.cardId,
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
              const newMembership: IMembership = {
                cardMembershipId: result.outCardMembershipId,
                cardId: currentCard.cardId,
                userId: addUser.userId,
                createdAt: result.outCreatedAt ? result.outCreatedAt : null,
                updatedAt: null,
                email: addUser.userEmail,
                userName: addUser.userName,
                avatarUrl: addUser.avatarUrl,
              };
              const newCardMembership = cardMemberships.concat(newMembership);
              setCardMemberships(newCardMembership);

              const newCardUserIds = cardUserIds.concat(id);
              setCardUserIds(newCardUserIds);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [board, currentCard.cardId, cardMemberships, cardUserIds, cookies.UserId]
  );

  const handleUserRemove = useCallback(
    (id: string) => {
      const deleteMember = cardMemberships
        .filter((user) => user.userId === id)
        .at(0);
      if (deleteMember) {
        console.log('handleUserRemove : ', id);
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: currentCard.cardId,
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
              const member_index = cardMemberships.findIndex(
                (membership) => membership.userId === id
              );
              const newCardMembership = [
                ...cardMemberships.slice(0, member_index),
                ...cardMemberships.slice(member_index + 1),
              ];
              setCardMemberships(newCardMembership);

              const userId_index = cardUserIds.findIndex(
                (userId) => userId === id
              );
              const newCardUserIds = [
                ...cardUserIds.slice(0, userId_index),
                ...cardUserIds.slice(userId_index + 1),
              ];
              setCardUserIds(newCardUserIds);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [currentCard.cardId, cardMemberships, cardUserIds, cookies.UserId]
  );

  //------------------Name Functions------------------
  const handleNameUpdate = useCallback(
    (data: string) => {
      console.log('Udate name of card : ', data);
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardName: data,
        cardActionType: 'UPDATE',
      };

      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update name of card', result.message);
          } else {
            console.log('Succeed to update name of card', result);
            const updatedCard = {
              ...currentCard,
              cardName: data,
            };
            setCurrentCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
    },
    [currentCard, cookies, setCurrentCard]
  );

  //------------------Description Functions------------------
  const handleDescriptionUpdate = useCallback(
    (data: string) => {
      console.log('Udate description of card : ', data);
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardActionType: 'UPDATE',
        description: data,
      };

      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update description of card', result.message);
          } else {
            console.log('Succeed to update description of card', result);
            const updatedCard = {
              ...currentCard,
              description: data,
            };
            setCurrentCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update description of card', message);
        });
    },
    [currentCard, cookies.UserId, setCurrentCard]
  );

  //------------------Label Functions------------------
  const handleLabelSelect = useCallback(
    (id: string) => {
      console.log('Select Label');
      const found_label = board.labels
        .filter((label) => label.labelId === id)
        .at(0);
      if (found_label) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: currentCard.cardId,
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
              const newLabels = currentCard.labels.concat(found_label);
              const updatedCard = {
                ...currentCard,
                labels: newLabels,
              };
              setCurrentCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [currentCard, cookies.UserId, board.labels, setCurrentCard]
  );

  const handleLabelUnselect = useCallback(
    (id: string) => {
      console.log('Unselect Label');
      const found_index = currentCard.labels.findIndex(
        (label) => label.labelId === id
      );
      if (found_index !== -1) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: currentCard.cardId,
          userId: cookies.UserId,
          cardLabelActionType: 'DELETE',
          cardLabelId: id,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log('Fail to update label selection', result.message);
            } else {
              console.log('Succeed to update label selection', result);
              const newLabels = [
                ...currentCard.labels.slice(0, found_index),
                ...currentCard.labels.slice(found_index + 1),
              ];
              const updatedCard = {
                ...currentCard,
                labels: newLabels,
              };
              setCurrentCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [currentCard, cookies.UserId, setCurrentCard]
  );

  const handleLabelCreate = useCallback(
    (data: { name: string | null; color: string }) => {
      console.log('Label Create');
      const modifiedBoard: IModifyBoard = {
        ...defaultModifyBoard,
        boardId: board.boardId,
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
              boardId: board.boardId,
              labelId: result.outLabelId,
              labelName: data.name ? data.name : '',
              color: data.color,
              position:"",
            };
            const newLabels = currentCard.labels.concat(newLabel);
            const updatedCard = {
              ...currentCard,
              labels: newLabels,
            };
            setCurrentCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to add label', message);
        });
    },
    [board.boardId, currentCard, cookies.UserId, setCurrentCard]
  );

  const handleLabelUpdate = useCallback(
    (data: { id: string; name?: string; color?: string }) => {
      const found_index = currentCard.labels.findIndex(
        (label) => label.labelId === data.id
      );
      if (found_index !== -1) {
        const modifiedBoard: IModifyBoard = {
          ...defaultModifyBoard,
          boardId: board.boardId,
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
              let newLabel = currentCard.labels[found_index];
              if (data.name) newLabel.labelName = data.name;
              if (data.color) newLabel.color = data.color;
              const newLabels = [
                ...currentCard.labels.slice(0, found_index),
                newLabel,
                ...currentCard.labels.slice(found_index + 1),
              ];
              const updatedCard = {
                ...currentCard,
                labels: newLabels,
              };
              setCurrentCard(updatedCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update label', message);
          });
      }
    },
    [board.boardId, currentCard, cookies.UserId, setCurrentCard]
  );

  const handleLabelDelete = useCallback(
    (id: string) => {
      console.log('Label Delete');
      const modifiedBoard: IModifyBoard = {
        ...defaultModifyBoard,
        boardId: board.boardId,
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
            const found_index = currentCard.labels.findIndex(
              (label) => label.labelId === id
            );
            const newLabels = [
              ...currentCard.labels.slice(0, found_index),
              ...currentCard.labels.slice(found_index + 1),
            ];
            const updatedCard = {
              ...currentCard,
              labels: newLabels,
            };
            setCurrentCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to delete label', message);
        });
    },
    [board.boardId, currentCard, cookies.UserId, setCurrentCard]
  );

  //------------------Due Date Functions------------------
  const handleDueDateUpdate = useCallback(
    (date: Date | null) => {
      let date_string = '-1';

      if (date) {
        const t_M = date.getMonth();
        const t_d = date.getDate();
        const t_h = date.getHours();
        const t_m = date.getMinutes();
        const t_s = date.getSeconds();

        date_string =
          date.getFullYear() +
          '-' +
          (t_M < 10 ? '0' + t_M : t_M) +
          '-' +
          (t_d < 10 ? '0' + t_d : t_d) +
          ' ' +
          (t_h < 10 ? '0' + t_h : t_h) +
          ':' +
          (t_m < 10 ? '0' + t_m : t_m) +
          ':' +
          (t_s < 10 ? '0' + t_s : t_s);
      }

      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
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
              ...currentCard,
              dueDate: date ? date_string : null,
            };
            setCurrentCard(updatedCard);
            setDueDate(date);
          }
        })
        .catch((message) => {
          console.log('Fail to update due date of card', message);
        });
    },
    [currentCard, cookies.UserId, setCurrentCard]
  );

  //------------------Stopwatch Functions------------------
  const handleStopwatchUpdate = useCallback(
    (stopwatch: IStopwatch | null) => {
      console.log('Check User id : ', cookies.UserId);
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardActionType: 'UPDATE',
        stopwatch: {
          total: stopwatch ? stopwatch.total : -1,
          startedAt: stopwatch
            ? stopwatch.startedAt
              ? stopwatch.startedAt
              : null
            : null,
        },
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
              ...currentCard,
              stopwatch: stopwatch,
            };
            setCurrentCard(updatedCard);
            setStopwatch(stopwatch);
          }
        })
        .catch((message) => {
          console.log('Fail to update stopwatch of card', message);
        });
    },
    [currentCard, cookies.UserId, setCurrentCard]
  );

  const handleToggleStopwatchClick = useCallback(() => {
    if (stopwatch?.startedAt) {
      handleStopwatchUpdate(stopStopwatch(stopwatch));
    } else {
      handleStopwatchUpdate(startStopwatch(stopwatch));
    }
  }, [handleStopwatchUpdate, stopwatch]);

  //------------------Task Functions------------------
  const handleTaskCreate = useCallback(
    (data: string) => {
      console.log('data of new task', data);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardTaskName: data,
        cardTaskPosition: '100000',
        cardTaskActionType: 'ADD',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeeded to get response', result);
          if (result.outTaskId) {
            const newTask = {
              ...defaultTask,
              taskId: result.outTaskId,
              taskName: data,
            };
            const newTasks = tasks.concat(newTask);
            setTasks(newTasks);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [tasks, cookies.UserId, currentCard.cardId]
  );

  const handleTaskUpdate = useCallback(
    (id: string, data: any) => {
      console.log('handleTaskUpdate - ', data);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardTaskId: id,
        cardTaskActionType: 'UPDATE',
      };

      if (data.hasOwnProperty('taskName')) {
        console.log('Update task of card / name', data.taskName);
        modifiedCard.cardTaskName = data.taskName;
      }
      if (data.hasOwnProperty('isCompleted')) {
        console.log('Update task of card / isCompleted', data.isCompleted);
        modifiedCard.cardTaskIsCompleted = data.isCompleted ? 'true' : 'false';
      }

      //setUpdating(true);
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeed to update task of card', result);
          const index = tasks.findIndex((task) => task.taskId === id);

          console.log('found index : ', index);
          if (index < 0) return;

          let newTask = tasks[index];
          console.log('found task : ', newTask);

          if (data.hasOwnProperty('taskName')) {
            console.log('update task name : ', data.taskName);
            newTask.taskName = data.taskName;
          }
          if (data.hasOwnProperty('isCompleted')) {
            console.log("update task's isCompleted : ", data.isComplated);
            newTask.isCompleted = data.isCompleted;
          }

          const newTasks = [
            ...tasks.slice(0, index),
            newTask,
            ...tasks.slice(index + 1),
          ];
          setTasks(newTasks);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [tasks, cookies.UserId, currentCard.cardId]
  );

  const handleTaskDelete = useCallback(
    (id: string) => {
      console.log('Delete task of card / id : ', id);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardTaskId: id,
        cardTaskActionType: 'DELETE',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeed to delete task of card', result);
          const index = tasks.findIndex((task) => task.taskId === id);
          console.log('found index : ', index);
          const newTasks = [
            ...tasks.slice(0, index),
            ...tasks.slice(index + 1),
          ];
          setTasks(newTasks);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [tasks, cookies.UserId, currentCard.cardId]
  );

  //------------------Comment Functions------------------
  const handleCommentsCreate = useCallback(
    (newText: string) => {
      console.log('data of new comment', newText);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardCommentText: newText,
        cardCommentActionType: 'ADD',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeeded to get response', result);
          if (result.outCommentId) {
            const newComment = {
              ...defaultComment,
              commentId: result.outActionId,
              cardId: currentCard.cardId,
              userId: cookies.UserId,
              userName: cookies.UserName,
              text: newText,
              createdAt: result.outCommentCreatedAt,
            };
            const newComments = [newComment, ...comments];
            setComments(newComments);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [currentCard.cardId, cookies, comments]
  );

  const handleCommentsUpdate = useCallback(
    (id: string, newText: string) => {
      console.log('handleActionUpdate - ', newText);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardCommentId: id,
        cardCommentText: newText,
        cardCommentActionType: 'UPDATE',
      };

      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeed to update comment of card', result);
          const index = comments.findIndex(
            (comment) => comment.commentId === id
          );

          if (index < 0) return;

          let newComment = comments[index];
          newComment.text = newText;
          newComment.updatedAt = result.outCommentUpdatedAt;

          const newComments = [
            ...comments.slice(0, index),
            newComment,
            ...comments.slice(index + 1),
          ];
          setComments(newComments);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [currentCard.cardId, cookies.UserId, comments]
  );

  const handleCommentsDelete = useCallback(
    (id: string) => {
      console.log('Delete Comment - comment of card / id : ', id);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: currentCard.cardId,
        userId: cookies.UserId,
        cardCommentId: id,
        cardCommentActionType: 'DELETE',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          console.log('Succeed to delete comment of card', result);
          const newComments = comments.filter(
            (comment) => comment.commentId !== id
          );
          setComments(newComments);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [currentCard.cardId, cookies.UserId, comments]
  );

  useEffect(() => {
    console.log('Card Modal Rendering :');  
  }, [])

  const contentNode = ( isLoading ? ('Now Loading ..... ') : (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={canEdit ? 12 : 16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon name="list alternate outline" className={styles.moduleIcon} />
            <div className={styles.headerTitleWrapper}>
              {canEdit ? (
                <NameField
                  defaultValue={currentCard.cardName}
                  onUpdate={handleNameUpdate}
                />
              ) : (
                <div className={styles.headerTitle}>{currentCard.cardName}</div>
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
          {(cardMemberships.length > 0 ||
            currentCard.labels.length > 0 ||
            dueDate ||
            stopwatch) && (
            <div className={styles.moduleWrapper}>
              {cardMemberships.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.members', {
                      context: 'title',
                    })}
                  </div>
                  {cardMemberships.map((user) => (
                    <span key={user.cardMembershipId} className={styles.attachment}>
                      {canEdit ? (
                        <CardMembershipPopup
                          items={board.users}
                          currentUserIds={cardUserIds}
                          onUserSelect={handleUserAdd}
                          onUserDeselect={handleUserRemove}
                        >
                          <User
                            userName={user.userName}
                            avatarUrl={user.avatarUrl}
                          />
                        </CardMembershipPopup>
                      ) : (
                        <User
                          userName={user.userName}
                          avatarUrl={user.avatarUrl}
                        />
                      )}
                    </span>
                  ))}
                  {canEdit && (
                    <CardMembershipPopup
                      items={board.users}
                      currentUserIds={cardUserIds}
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
                    </CardMembershipPopup>
                  )}
                </div>
              )}
              {currentCard.labels.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.labels', {
                      context: 'title',
                    })}
                  </div>
                  {currentCard.labels.map((label) => (
                    <span key={label.labelId} className={styles.attachment}>
                      {canEdit ? (
                        <LabelsPopup
                          key={label.labelId}
                          items={board.labels}
                          canEdit={canEdit}
                          onSelect={handleLabelSelect}
                          onDeselect={handleLabelUnselect}
                          onCreate={handleLabelCreate}
                          onUpdate={handleLabelUpdate}
                          // onMove={onLabelMove}
                          onDelete={handleLabelDelete}
                        >
                          <Label
                            name={label.labelName}
                            color={label.color}
                          />
                        </LabelsPopup>
                      ) : (
                        <Label
                          name={label.labelName}
                          color={label.color}
                        />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {dueDate && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.dueDate', {
                      context: 'title',
                    })}
                  </div>
                  <span className={styles.attachment}>
                    {canEdit ? (
                      <DueDateEdit
                        defaultValue={dueDate}
                        onUpdate={handleDueDateUpdate}
                      >
                        <DueDate value={dueDate} />
                      </DueDateEdit>
                    ) : (
                      <DueDate value={dueDate} />
                    )}
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
                    {canEdit ? (
                      <StopwatchEdit
                        defaultValue={stopwatch}
                        onUpdate={handleStopwatchUpdate}
                      >
                        <Stopwatch
                          startedAt={stopwatch.startedAt}
                          total={stopwatch.total}
                        />
                      </StopwatchEdit>
                    ) : (
                      <Stopwatch
                        startedAt={stopwatch.startedAt}
                        total={stopwatch.total}
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
          {(currentCard.description || canEdit) && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="align justify" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.description')}
                </div>
                {canEdit ? (
                  <DescriptionEdit
                    defaultValue={currentCard.description}
                    onUpdate={handleDescriptionUpdate}
                  >
                    {currentCard.description ? (
                      <button
                        type="button"
                        className={classNames(
                          styles.descriptionText,
                          styles.cursorPointer
                        )}
                      >
                        <Markdown linkStopPropagation linkTarget="_blank">
                          {currentCard.description}
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
                      {currentCard.description}
                    </Markdown>
                  </div>
                )}
              </div>
            </div>
          )}
          {(tasks.length > 0 || canEdit) && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon
                  name="check square outline"
                  className={styles.moduleIcon}
                />
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
          <Activities
            items={comments}
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
              <CardMembershipPopup
                items={board.users}
                currentUserIds={cardUserIds}
                onUserSelect={handleUserAdd}
                onUserDeselect={handleUserRemove}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon name="user outline" className={styles.actionIcon} />
                  {t('common.members')}
                </Button>
              </CardMembershipPopup>
              <Button fluid className={styles.actionButton}>
                <Icon name="bookmark outline" className={styles.actionIcon} />
                {t('common.labels')}
              </Button>
              <DueDateEdit
                defaultValue={dueDate}
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
                defaultValue={stopwatch}
                onUpdate={handleStopwatchUpdate}
              >
                <Button fluid className={styles.actionButton}>
                  <Icon name="clock outline" className={styles.actionIcon} />
                  {t('common.stopwatch')}
                </Button>
              </StopwatchEdit>
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
                <Icon
                  name="paper plane outline"
                  className={styles.actionIcon}
                />
                {
                  /*isSubscribed ? t('action.unsubscribe') : */ t(
                    'action.subscribe'
                  )
                }
              </Button>
              <Button
                fluid
                className={styles.actionButton}
                //onClick={handleToggleSubscriptionClick}
              >
                <Icon
                  name="share square outline"
                  className={styles.actionIcon}
                />
                {t('action.move')}
              </Button>
              <Button
                fluid
                className={styles.actionButton}
                //onClick={handleToggleSubscriptionClick}
              >
                <Icon
                  name="share square outline"
                  className={styles.actionIcon}
                />
                {t('action.delete')}
              </Button>
            </div>
          </Grid.Column>
        )}
      </Grid.Row>
    </Grid>
  ));

  return (
    <Modal
      open
      closeIcon
      centered={false}
      className={styles.wrapper}
      onClose={handleOnCloseCardModel}
    >
      {contentNode}
    </Modal>
  );
};

export default CardModal;
