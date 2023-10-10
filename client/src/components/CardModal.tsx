import { useState, useCallback, useRef, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { apiModifyBoard } from '../api/board';
import { apiDeleteAttatchment, apiModifyCard, apiUploadAttatchment } from '../api/card';
import { defaultComment } from '../atoms/atomAction';
import {
  ICard,
  atomCurrentCard,
  defaultCard,
  IModifyCard,
  defaultModifyCard,
  IAttachment,
  ICardUser,
  IImage,
} from '../atoms/atomCard';
import {
  atomCurrentMyBoard,
  ICurrent,
  IModifyBoard,
  defaultModifyBoard,
  cardSelectorCardId,
} from '../atoms/atomsBoard';
import { defaultTask } from '../atoms/atomTask';
import { IStopwatch } from '../atoms/atomStopwatch';
import { ILabel } from '../atoms/atomLabel';
import Activities from './Activities';
import DescriptionEdit from './DescriptionEdit';
import CardModalTasks from './CardModalTasks';
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
import Attachments from './Attachments';
import AttachmentAddPopup from './AttachmentAddPopup';

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
  const [card, setCard] = useRecoilState<ICard>(atomCurrentCard);
  const [cardUserIds, setCardUserIds] = useState<string[]>([]);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  const updateCard = useSetRecoilState(cardSelectorCardId(card.cardId));

  const isGalleryOpened = useRef(false);

  const handleOnCloseCardModel = useCallback(() => {
    updateCard(card);
    setCard(defaultCard);
  }, [card, setCard, updateCard]);

  //------------------Membership Functions------------------
  const handleUserAdd = useCallback(
    (id: string) => {
      console.log('handleUserAdd : ', id);
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

              const newCurrentCard = {
                ...card,
                memberships: newCardMembership,
              };
              setCard(newCurrentCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [board.users, card, cookies.UserId, cardUserIds, setCard]
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

              const newCurrentCard = {
                ...card,
                memberships: newCardMembership,
              };
              setCard(newCurrentCard);
            }
          })
          .catch((message) => {
            console.log('Fail to update name of card', message);
          });
      }
    },
    [card.memberships, card, cookies.UserId, cardUserIds, setCard]
  );

  //------------------Name Functions------------------
  const handleNameUpdate = useCallback(
    (data: string) => {
      console.log('Udate name of card : ', data);
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
            console.log('Succeed to update name of card', result);
            const updatedCard = {
              ...card,
              cardName: data,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
    },
    [card, cookies, setCard]
  );

  //------------------Description Functions------------------
  const handleDescriptionUpdate = useCallback(
    (data: string) => {
      console.log('Udate description of card : ', data);
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
            console.log('Succeed to update description of card', result);
            const updatedCard = {
              ...card,
              description: data,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Fail to update description of card', message);
        });
    },
    [card, cookies.UserId, setCard]
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
    [card, cookies.UserId, board.labels, setCard]
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
    [board.boardId, card, cookies.UserId, setCard]
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
    [board.boardId, card, cookies.UserId, setCard]
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
    [board.boardId, card, cookies.UserId, setCard]
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
              stopwatch: newStopwatch,
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
      console.log('data of new task', data);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
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
            const newTasks = card.tasks.concat(newTask);
            const updatedCard = {
              ...card,
              tasks: newTasks,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  const handleTaskUpdate = useCallback(
    (id: string, data: any) => {
      console.log('handleTaskUpdate - ', data);
      let modifiedCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: card.cardId,
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
          const index = card.tasks.findIndex((task) => task.taskId === id);

          console.log('found index : ', index);
          if (index < 0) return;

          let newTask = card.tasks[index];
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
            ...card.tasks.slice(0, index),
            newTask,
            ...card.tasks.slice(index + 1),
          ];

          const updatedCard = {
            ...card,
            tasks: newTasks,
          };
          setCard(updatedCard);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  const handleTaskDelete = useCallback(
    (id: string) => {
      console.log('Delete task of card / id : ', id);
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
          console.log('Succeed to delete task of card', result);
          const index = card.tasks.findIndex((task) => task.taskId === id);
          console.log('found index : ', index);
          const newTasks = [
            ...card.tasks.slice(0, index),
            ...card.tasks.slice(index + 1),
          ];
          const updatedCard = {
            ...card,
            tasks: newTasks,
          };
          setCard(updatedCard);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  //------------------Attachment Functions------------------
  const handleAttachmentCreate = useCallback(
    async (file: any) => {
      console.log('handleAttachmentCreate : ', file);
      const fileData = file.file;
      const fileName = fileData.name;
      const fileNameSplitted = fileName.split('.');
      const fileExt =
        fileNameSplitted.length > 1
          ? fileNameSplitted[fileNameSplitted.length - 1]
          : '';
      console.log('handleAttachmentCreate / file name : ', fileName);
      console.log('handleAttachmentCreate / file ext : ', fileExt);

      const formData = new FormData();
      formData.append('cardId', card.cardId);
      formData.append('fileName', fileName);
      formData.append('fileExt', fileExt);
      formData.append('userId', cookies.UserId);
      formData.append('file', fileData);
      let imageInfo : (IImage | null) = null;
      if (fileData.type.startsWith('image/')) {
        const image = new Image();
        image.src = URL.createObjectURL(fileData);
        image.onload = async () => {
          const width = image.width;
          const height = image.height;

          formData.append('width', width.toString());
          formData.append('height', height.toString());

          imageInfo = {
            width: width,
            height: height,
            thumbnailsExtension: fileExt,
          }
        };
      }

      const response = await apiUploadAttatchment(formData);
      if(response) {
        console.log('handleAttachmentCreate / response : ', response);
        if(response.message) {
          console.log('Failt to upload file');
        } else {
          const newAttachment: IAttachment = {
            cardAttachementId: response.outAttachmentId,
            cardId: card.cardId,
            creatorUserId: cookies.UserId,
            creatorUserName: cookies.UserName,
            dirName: '',
            fileName: fileName,
            cardAttachmentName: fileName,
            createdAt: response.outAttachmentCreatedAt,
            updatedAt: null,
            image: imageInfo,
            url: response.filePath,
            coverUrl: '',
            isCover: false,
            isPersisted: false,
          };
          const newCurrentCard = {
            ...card,
            attachments: card.attachments.concat(newAttachment),
          };
          setCard(newCurrentCard);
        }
      }
    },
    [card, cookies.UserId, cookies.UserName, setCard]
  );

  const handleAttachmentUpdate = useCallback(
    (id: string, data: any) => {
      console.log('handleAttachmentUpdate : ', id, data);
      // After server side update Process
      const newAttachment: IAttachment = {
        cardAttachementId: id,
        cardId: card.cardId,
        creatorUserId: cookies.UserId,
        creatorUserName: cookies.UserName,
        dirName: 'da24d0d3-157b-4bdc-bf80-45ce90dd9188',
        fileName: 'fileName',
        cardAttachmentName: 'fileName',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        image: null,
        url: 'url',
        coverUrl: 'coverUrl',
        isCover: false,
        isPersisted: false,
      };
      const found_idx = card.attachments.findIndex(
        (item) => item.cardId === id
      );
      const newAttachments = {
        ...card.attachments.slice(0, found_idx),
        newAttachment,
        ...card.attachments.slice(found_idx + 1),
      };
      const updateCard = {
        ...card,
        Attachments: newAttachments,
      };
      setCard(updateCard);
    },
    [card, cookies.UserId, cookies.UserName, setCard]
  );

  const handleAttachmentDelete = useCallback(
    async (id: string) => {
      console.log('handleAttachmentDelete : ', id);
      // After server side delete Process
      const found_idx = card.attachments.findIndex(
        (item) => item.cardAttachementId === id
      );
      if (found_idx !== -1) {
        const found_card = card.attachments[found_idx];
        const file_name_splitted = found_card.fileName.split('.');
        const file_name_splitted_length = file_name_splitted.length;
        const file_ext =
          file_name_splitted_length > 1
            ? file_name_splitted[file_name_splitted_length - 1]
            : '';
        const deleteCard = {
          cardAttachmentId: found_card.cardAttachementId,
          userId: cookies.UserId,
          cardId: card.cardId,
          fileExt: file_ext,
          fileName: found_card.fileName,
        };
        const response = await apiDeleteAttatchment(deleteCard);
        if(response) {
          if(response.message)
            console.log('Fail to delete file');
          else {
            console.log('Delete file', response.fileName, response.filePath);
            const newAttachments = card.attachments.filter(
              (item) => item.cardAttachementId !== id
            );
            const updateCard = {
              ...card,
              Attachments: newAttachments,
            };
            setCard(updateCard);
          }
        }
      }
    },
    [card, cookies.UserId, setCard]
  );

  const handleCoverUpdate = useCallback(() => {
    console.log('handleCoverUpdate');
  }, []);

  const handleGalleryOpen = useCallback(() => {
    console.log('handleGalleryOpen');
    isGalleryOpened.current = true;
  }, []);

  const handleGalleryClose = useCallback(() => {
    console.log('handleGalleryClose');
    isGalleryOpened.current = false;
  }, []);

  //------------------Comment Functions------------------
  const handleCommentsCreate = useCallback(
    (newText: string) => {
      console.log('data of new comment', newText);
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
          console.log('Succeeded to get response', result);
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
            const updatedCard = {
              ...card,
              comments: newComments,
            };
            setCard(updatedCard);
          }
        })
        .catch((message) => {
          console.log('Failed to get response', message);
        });
    },
    [card, cookies.UserId, cookies.UserName, setCard]
  );

  const handleCommentsUpdate = useCallback(
    (id: string, newText: string) => {
      console.log('handleActionUpdate - ', newText);
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
          console.log('Succeed to update comment of card', result);
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

          const updatedCard = {
            ...card,
            comments: newComments,
          };
          setCard(updatedCard);
        })
        .catch((message) => {
          console.log('Fail to update task of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  const handleCommentsDelete = useCallback(
    (id: string) => {
      console.log('Delete Comment - comment of card / id : ', id);
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
          console.log('Succeed to delete comment of card', result);
          const newComments = card.comments.filter(
            (comment) => comment.commentId !== id
          );

          const updatedCard = {
            ...card,
            comments: newComments,
          };
          setCard(updatedCard);
        })
        .catch((message) => {
          console.log('Fail to delete task of card', message);
        });
    },
    [card, cookies.UserId, setCard]
  );

  useEffect(() => {
    console.log('Card Modal Rendering/card : ', card.attachments);
  }, [card]);

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
                          <Label name={label.labelName} color={label.color} />
                        </LabelsPopup>
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
                  //onMove={onTaskMove}
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
              <LabelsPopup
                items={board.labels}
                canEdit={canEdit}
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
              </LabelsPopup>
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
              <AttachmentAddPopup onCreate={handleAttachmentCreate}>
                <Button fluid className={styles.actionButton}>
                  <Icon name="attach" className={styles.actionIcon} />
                  {t('common.attachment')}
                </Button>
              </AttachmentAddPopup>
            </div>
            <div className={styles.actions}>
              <span className={styles.actionsTitle}>{t('common.actions')}</span>
              {/* <Button
                fluid
                className={styles.actionButton}
                //onClick={handleToggleSubscriptionClick}
              >
                <Icon
                  name="paper plane outline"
                  className={styles.actionIcon}
                />
                {
                  isSubscribed ? t('action.unsubscribe') :  t(
                    'action.subscribe'
                  )
                }
              </Button> */}
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
  );

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
