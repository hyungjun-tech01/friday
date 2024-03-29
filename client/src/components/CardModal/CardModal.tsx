import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { apiModifyBoard } from '../../api/board';
import {
  apiDeleteAttatchment,
  apiModifyCard,
  apiUploadAttatchment,
} from '../../api/card';
import { defaultComment } from '../../atoms/atomAction';
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
import { defaultTask, ITask } from '../../atoms/atomTask';
import { IStopwatch } from '../../atoms/atomStopwatch';
import { ILabel } from '../../atoms/atomLabel';
import { atomProjectsToLists } from '../../atoms/atomsProject';
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

import { getDateStringForDB } from '../../utils/date';
import { usePopup } from '../../lib/hook';
import classNames from 'classnames';
import styles from './CardModal.module.scss';
import { startStopwatch, stopStopwatch } from '../../utils/stopwatch';
import { getNextPosition } from '../../utils/position';
import DeletePopup from '../DeletePopup';

interface ICardPathProps {
  projectId: string | null,
  boardId: string | null,
  listId: string | null,
};

interface ICardModalProps {
  canEdit: boolean,
  onDelete: (id:string) => void,
}

const CardModal = ({ canEdit, onDelete }: ICardModalProps) => {
  const [t] = useTranslation();
  const [board, setBoard] = useRecoilState<ICurrent>(atomCurrentMyBoard);
  const [card, setCard] = useRecoilState<ICard>(atomCurrentCard);
  const [cardUserIds, setCardUserIds] = useState<string[]>([]);
  const [selectedLabelIds, setSeletedLabelIds] = useState<string[]>([]);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  const updateCard = useSetRecoilState(cardSelectorCardId(card.cardId));
  
  const projectsToLists = useRecoilValue(atomProjectsToLists);
  const [cardPath, setCardPath] = useState<ICardPathProps>({
    projectId: null, boardId: null, listId: null
  });
  const {addSubscription, removeSubscription, isSubscribed} = useRecoilValue(SubscriptionRepository);
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
      setCardUserIds(member_ids);
    };
    if (card.labels) {
      const label_ids = card.labels.map((label) => label.labelId);
      setSeletedLabelIds(label_ids);
    };
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
    };
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
      const addUser = board.users.filter((user) => user.userId === id).at(0);
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

              const newCard = {
                ...card,
                memberships: newCardMembership,
              };
              updateCard(newCard);
              setCard(newCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [board.users, card, cookies.UserId, cardUserIds]
  );

  const handleUserRemove = useCallback(
    (id: string) => {
      const deleteMember = card.memberships
        .filter((user) => user.userId === id)
        .at(0);
      if (deleteMember) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardMembershipActionType: 'DELETE',
          cardMembershipId: deleteMember.cardMembershipId,
          cardMembershipUserId: deleteMember.userId,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            if (result.message) {
              console.log(
                'Fail to update delete membership of card',
                result.message
              );
            } else {
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

              const newCard = {
                ...card,
                memberships: newCardMembership,
              };
              updateCard(newCard);
              setCard(newCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId, cardUserIds]
  );

  //------------------Name Functions------------------
  const handleNameUpdate = useCallback(
    (data: string) => {
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
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
            const newCard = {
              ...card,
              cardName: data,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
    },
    [card, cookies]
  );

  //------------------Description Functions------------------
  const handleDescriptionUpdate = useCallback(
    (data: string) => {
      const modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
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
            const newCard = {
              ...card,
              description: data,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update description of card', message);
        });
    },
    [card, cookies.UserId]
  );

  //------------------Label Functions------------------
  const handleLabelSelect = useCallback(
    (id: string) => {
      const found_label = board.labels
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
              const newLabels = card.labels.concat(found_label);
              const newCard: ICard = {
                ...card,
                labels: newLabels,
              };
              updateCard(newCard);
              setCard(newCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId, board.labels]
  );

  const handleLabelUnselect = useCallback(
    (id: string) => {
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
              const newLabels = [
                ...card.labels.slice(0, found_index),
                ...card.labels.slice(found_index + 1),
              ];
              const newCard: ICard = {
                ...card,
                labels: newLabels,
              };
              updateCard(newCard);
              setCard(newCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card, cookies.UserId]
  );

  const handleLabelCreate = useCallback(
    (data: { name: string | null; color: string }) => {
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
            const newLabel: ILabel = {
              boardId: board.boardId,
              labelId: result.outLabelId,
              labelName: data.name ? data.name : '',
              color: data.color,
              position: '',
            };
            const newLabels = board.labels.concat(newLabel);
            const updateBoard = {
              ...board,
              labels: newLabels
            };
            setBoard(updateBoard);
          }
        })
        .catch((message) => {
          console.log('Fail to add label', message);
        });
    },
    [board.boardId, card, cookies.UserId]
  );

  const handleLabelUpdate = useCallback(
    (data: { id: string; name?: string; color?: string }) => {
      const found_index = card.labels.findIndex(
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
              let newLabel = card.labels[found_index];
              if (data.name) newLabel.labelName = data.name;
              if (data.color) newLabel.color = data.color;
              const newLabels = [
                ...card.labels.slice(0, found_index),
                newLabel,
                ...card.labels.slice(found_index + 1),
              ];
              const newCard = {
                ...card,
                labels: newLabels,
              };
              updateCard(newCard);
              setCard(newCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update label', message);
          });
      }
    },
    [board.boardId, card, cookies.UserId]
  );

  const handleLabelDelete = useCallback(
    (id: string) => {
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
            const found_index = card.labels.findIndex(
              (label) => label.labelId === id
            );
            const newLabels = [
              ...card.labels.slice(0, found_index),
              ...card.labels.slice(found_index + 1),
            ];
            const newCard = {
              ...card,
              labels: newLabels,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Fail to delete label', message);
        });
    },
    [board.boardId, card, cookies.UserId]
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
            const newCard = {
              ...card,
              dueDate: date ? date_string : null,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update due date of card', message);
        });
    },
    [card, cookies.UserId]
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
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update stopwatch of card', result.message);
          } else {
            const newCard = {
              ...card,
              stopwatch: stopwatch ? newStopwatch : null,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update stopwatch of card', message);
        });
    },
    [card, cookies.UserId, setCard]
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
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardTaskName: data,
        cardTaskActionType: 'ADD',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.outTaskId) {
            const newTask = {
              ...defaultTask,
              taskId: result.outTaskId,
              taskName: data,
            };
            const newTasks = card.tasks.concat(newTask);
            const newCard = {
              ...card,
              tasks: newTasks,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [card, cookies.UserId]
  );

  const handleTaskUpdate = useCallback(
    (id: string, data: any) => {
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardTaskId: id,
        cardTaskActionType: 'UPDATE',
      };

      if (data.hasOwnProperty('taskName')) {
        modifiedCard.cardTaskName = data.taskName;
      }
      if (data.hasOwnProperty('isCompleted')) {
        modifiedCard.cardTaskIsCompleted = data.isCompleted ? 'true' : 'false';
      }

      //setUpdating(true);
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          const index = card.tasks.findIndex((task) => task.taskId === id);
          if (index < 0) return;

          let newTask = { ...card.tasks[index] };
          if (data.hasOwnProperty('taskName')) {
            newTask.taskName = data.taskName;
          }
          if (data.hasOwnProperty('isCompleted')) {
            newTask.isCompleted = data.isCompleted;
          }
          const newTasks = [
            ...card.tasks.slice(0, index),
            newTask,
            ...card.tasks.slice(index + 1),
          ];
          const newCard = {
            ...card,
            tasks: newTasks,
          };
          updateCard(newCard);
          setCard(newCard);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [card, cookies.UserId]
  );

  const handleTaskMove = useCallback((pick:string, idx:number) => {
    console.log('CardModal: handleTaskMove / ', pick, idx);
    // Need to update positon of dragging task at first
    const pickingTask = card.tasks.filter((task:ITask) => task.taskId === pick)[0];
    const remainingTasks = card.tasks.filter((task:ITask) => task.taskId !== pick);
    const updatePosition = getNextPosition(remainingTasks, idx);
    const modifiedCard: IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardTaskPosition: updatePosition,
      cardTaskActionType: 'UPDATE',
    };
    const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if(result.message) {
            console.log('Fail to move Task : ', result.message);
          }
          else {
            const updateTask = {
              ...pickingTask,
              position : updatePosition,
            };
            const updateTasks = [
              ...remainingTasks.slice(0, idx),
              updateTask,
              ...remainingTasks.slice(idx)
            ];
            const updateCard = {
              ...card,
              tasks : updateTasks
            };
            setCard(updateCard);
          };
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        })
  }, [card, cookies.UserId, setCard]);

  const handleTaskDelete = useCallback(
    (id: string) => {
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardTaskId: id,
        cardTaskActionType: 'DELETE',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          const index = card.tasks.findIndex((task) => task.taskId === id);
          const newTasks = [
            ...card.tasks.slice(0, index),
            ...card.tasks.slice(index + 1),
          ];
          const newCard = {
            ...card,
            tasks: newTasks,
          };
          setCard(newCard);
          updateCard(newCard);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  //------------------Attachment Functions------------------
  const handleAttachmentCreate = useCallback(
    (file: any) => {
      const fileData = file.file;
      const fileName = fileData.name;
      
      const ext_index = fileName.lastIndexOf('.');
      const fileExt = ext_index !== -1 ? fileName.slice(ext_index + 1) : "";
      console.log('File extenstion is : ', fileExt);
      
      let imageInfo: IImage | null = null;

      const upload = (data: FormData) => {
        const response = apiUploadAttatchment(data);
        response
          .then((result) => {
            const newAttachment: IAttachment = {
              cardAttachementId: result.outAttachmentId,
              cardId: card.cardId,
              creatorUserId: cookies.UserId,
              creatorUserName: cookies.UserName,
              dirName: result.dirName,
              fileName: fileName,
              cardAttachmentName: fileName,
              createdAt: result.outAttachmentCreatedAt,
              updatedAt: null,
              image: imageInfo,
              url: result.outAttachmentUrl,
              coverUrl: result.outAttachmentCoverUrl,
              isCover: false,
              isPersisted: false,
            };
            const newCard = {
              ...card,
              attachments: [newAttachment, ...card.attachments],
            };
            updateCard(newCard);
            setCard(newCard);
          })
          .catch((error) => {
            console.log('Fail to upload file :', error);
          });
      };

      const formData = new FormData();
      formData.append('cardId', card.cardId);
      formData.append('fileName', fileName);
      formData.append('fileExt', fileExt);
      formData.append('userId', cookies.UserId);
      formData.append('file', fileData);

      if (fileData.type.startsWith('image/')) {
        const image = new Image();
        image.src = URL.createObjectURL(fileData);
        image.onload = () => {
          const width = image.width;
          const height = image.height;

          formData.append('width', width.toString());
          formData.append('height', height.toString());

          imageInfo = {
            width: width,
            height: height,
            thumbnailsExtension: fileExt,
          };

          upload(formData);
          URL.revokeObjectURL(image.src);
        };
      } else {
        upload(formData);
      }
    },
    [card, cookies.UserId, cookies.UserName, setCard, updateCard]
  );

  const handleAttachmentUpdate = useCallback(
    (id: string, data: any) => {
      // After server side update Process
      if (data.hasOwnProperty('name')) {
        const modifiedCard: IModifyCard = {
          ...defaultModifyCard,
          cardId: card.cardId,
          userId: cookies.UserId,
          cardAttachmentId: id,
          cardAttachmentActionType: 'UPDATE',
          cardAttachmentName: data.name,
        };
        const response = apiModifyCard(modifiedCard);
        response
          .then((result) => {
            const found_idx = card.attachments.findIndex(
              (item) => item.cardAttachementId === id
            );
            if (found_idx !== -1) {
              const newAttachment: IAttachment = {
                ...card.attachments[found_idx],
                cardAttachmentName: data.name,
                updatedAt: result.outAttachmentUpdatedAt,
              };
              const newAttachments = [
                ...card.attachments.slice(0, found_idx),
                newAttachment,
                ...card.attachments.slice(found_idx + 1),
              ];
              const newCard = {
                ...card,
                attachments: newAttachments,
              };
              updateCard(newCard);
              setCard(newCard);
            } else {
              console.log("Couldn't find attachment");
            }
          })
          .catch((message) => {
            console.log('Fail to update name of attachment', message);
          });
      }
    },
    [card, cookies.UserId]
  );

  const handleAttachmentDelete = useCallback(
    async (id: string) => {
      // After server side delete Process
      const found_idx = card.attachments.findIndex(
        (item) => item.cardAttachementId === id
      );
      if (found_idx !== -1) {
        const found_card = card.attachments[found_idx];
        const deleteCard = {
          cardAttachmentId: found_card.cardAttachementId,
          userId: cookies.UserId,
          cardId: card.cardId,
          fileExt: found_card.image?.thumbnailsExtension,
          fileName: found_card.fileName,
          dirName: found_card.dirName
        };
        const response = await apiDeleteAttatchment(deleteCard);
        if (response) {
          if (response.message) console.log('Fail to delete file');
          else {
            const newAttachments = card.attachments.filter(
              (item) => item.cardAttachementId !== id
            );
            const newCard = {
              ...card,
              attachments: newAttachments,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        }
      }
    },
    [card, cookies.UserId]
  );

  const handleCoverUpdate = useCallback(() => {
  }, []);

  const handleGalleryOpen = useCallback(() => {
    isGalleryOpened.current = true;
  }, []);

  const handleGalleryClose = useCallback(() => {

    isGalleryOpened.current = false;
  }, []);

  //------------------Comment Functions------------------
  const handleCommentsCreate = useCallback(
    (newText: string) => {
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardCommentText: newText,
        cardCommentActionType: 'ADD',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          if (result.outCommentId) {
            const newComment = {
              ...defaultComment,
              commentId: result.outActionId,
              cardId: card.cardId,
              userId: cookies.UserId,
              userName: cookies.UserName,
              text: newText,
              createdAt: result.outCommentCreatedAt,
            };
            const newComments = [newComment, ...card.comments];
            const newCard = {
              ...card,
              comments: newComments,
            };
            updateCard(newCard);
            setCard(newCard);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [card, cookies.UserId, cookies.UserName]
  );

  const handleCommentsUpdate = useCallback(
    (id: string, newText: string) => {
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardCommentId: id,
        cardCommentText: newText,
        cardCommentActionType: 'UPDATE',
      };

      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          const index = card.comments.findIndex(
            (comment) => comment.commentId === id
          );

          if (index < 0) return;

          let newComment = card.comments[index];
          newComment.text = newText;
          newComment.updatedAt = result.outCommentUpdatedAt;

          const newComments = [
            ...card.comments.slice(0, index),
            newComment,
            ...card.comments.slice(index + 1),
          ];

          const newCard = {
            ...card,
            comments: newComments,
          };
          updateCard(newCard);
          setCard(newCard);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [card, cookies.UserId]
  );

  const handleCommentsDelete = useCallback(
    (id: string) => {
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
        userId: cookies.UserId,
        cardCommentId: id,
        cardCommentActionType: 'DELETE',
      };
      const response = apiModifyCard(modifiedCard);
      response
        .then((result) => {
          const newComments = card.comments.filter(
            (comment) => comment.commentId !== id
          );

          const newCard = {
            ...card,
            comments: newComments,
          };
          updateCard(newCard);
          setCard(newCard);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [card, cookies.UserId]
  );

  //------------------Card Functions------------------
  const handleCardMove = useCallback((newlistId: string) => {
    const modifiedCard : IModifyCard = {
      ...defaultModifyCard,
      userId: cookies.UserId,
      cardId : card.cardId,
      listId : newlistId,
      cardActionType: 'MOVE',
    };
    const response = apiModifyCard(modifiedCard);
    response
      .then((result) => {
        if (result.message) {
          console.log('Fail to move card', result.message);
        } else {
          const found_list_idx = board.lists.findIndex((list) => list.listId === newlistId);
          if(found_list_idx === -1) {
            const found_card_idx = board.cards.findIndex((cardInBoard) => cardInBoard.cardId === card.cardId);
            if(found_card_idx !== -1) {
              const updateCards = [
                ...board.cards.slice(0, found_card_idx),
                ...board.cards.slice(found_card_idx + 1)
              ];
              const updateCurrentBoard = {
                ...board,
                cards : updateCards
              };
              setBoard(updateCurrentBoard);
            }
          }
          else {
            const found_card_idx = board.cards.findIndex((cardInBoard) => cardInBoard.cardId === card.cardId);
            if(found_card_idx !== -1) {
              const updateCard = {
                ...board.cards[found_card_idx],
                listId: newlistId
              };
              const updateCards = [
                ...board.cards.slice(0, found_card_idx),
                updateCard,
                ...board.cards.slice(found_card_idx + 1)
              ];
              const updateCurrentBoard = {
                ...board,
                cards: updateCards
              };
              setBoard(updateCurrentBoard);
            };
          };
        };
        handleOnCloseCardModal();
      })
      .catch((message) => {
        console.log('Fail to move card', message);
      });
  }, [board, card.cardId, cookies.UserId, handleOnCloseCardModal, setBoard]);

  const handleCardDelete = useCallback(() => {
    onDelete(card.cardId);
    setCard(defaultCard);
  }, [card.cardId, onDelete, setCard]);

  const handleSubscribeClick = useCallback(() => {
    if(subscribed) {
      removeSubscription(card.cardId, cookies.UserId);
    } else {
      addSubscription(card.cardId, cookies.UserId);
    };
    setSubscribed(!subscribed);
  }, [addSubscription, card.cardId, cookies.UserId, removeSubscription, subscribed])

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
                          currentUserIds={cardUserIds}
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
                currentUserIds={cardUserIds}
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
              <CardMove
                defaultPath={cardPath}
                onMove={handleCardMove}
              >
                <Button
                  fluid
                  className={styles.actionButton}
                >
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
                <Button
                  fluid
                  className={styles.actionButton}
                >
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
