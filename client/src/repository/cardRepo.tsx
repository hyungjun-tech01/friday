import { selector } from 'recoil';
import { atomCurrentMyBoard, defaultCurrentMyBoard } from '../atoms/atomsBoard';
import {
  atomCurrentCard,
  defaultCard,
  defaultModifyCard,
  IAttachment,
  ICardUser,
  IImage,
  IModifyCard,
} from '../atoms/atomCard';
import { defaultComment } from '../atoms/atomAction';
import { defaultTask } from '../atoms/atomTask';
import { IStopwatch } from '../atoms/atomStopwatch';
import {
  apiDeleteAttatchment,
  apiModifyCard,
  apiUploadAttatchment,
} from '../api/card';
import { getDateStringForDB } from '../utils/date';
import { getNextPosition } from '../utils/position';
import Paths from '../constants/Paths';
const BASE_PATH = Paths.BASE_PATH;

export const CardRepository = selector({
  key: 'CardRepository',
  get: ({ getCallback }) => {
    //------------------Membership Functions----------------
    const addMembershipIntoCard = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, membershipId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return false;
          }
          const addUser = currentBoard.users
            .filter((user) => user.userId === membershipId)
            .at(0);
          if (!addUser) {
            console.log('No user having input id');
            return false;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return false;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardMembershipActionType: 'ADD',
            cardMembershipUserId: membershipId,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to add indicated user', result.message);
                return false;
              }
              const newMembership: ICardUser = {
                cardMembershipId: result.outCardMembershipId,
                cardId: cardId,
                userId: addUser.userId,
                createdAt: result.outCreatedAt ? result.outCreatedAt : null,
                updatedAt: null,
                email: addUser.userEmail,
                userName: addUser.userName,
                avatarUrl: addUser.avatarUrl,
              };
              const newCardMembership =
                found_card.memberships.concat(newMembership);
              const newCard = {
                ...found_card,
                memberships: newCardMembership,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
              return true;
            })
            .catch((message) => {
              console.log('Fail to get response', message);
              return false;
            });
        }
    );
    const removeMembershipFromCard = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, id: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log('No Current Board');
            return false;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return false;
          }
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const found_card = currentBoard.cards[found_card_idx];
          const deleteMember = found_card.memberships
            .filter((user) => user.userId === id)
            .at(0);

          if (!deleteMember) {
            console.log('No user having input id');
            return false;
          }
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
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
                return false;
              }
              const member_index = found_card.memberships.findIndex(
                (membership) => membership.userId === id
              );
              const newCardMembership = [
                ...found_card.memberships.slice(0, member_index),
                ...found_card.memberships.slice(member_index + 1,),
              ];
              const newCard = {
                ...found_card,
                memberships: newCardMembership,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1,),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
              return true;
            })
            .catch((message) => {
              console.log('Fail to get response', message);
              return false;
            });
        }
    );
    //------------------Name Functions----------------------
    const updateCardName = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, data: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log('No Current Board');
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardName: data,
            cardActionType: 'UPDATE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update name of card', result.message);
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newCard = {
                ...currentBoard.cards[found_card_idx],
                cardName: data,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updateCurrentBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updateCurrentBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to get response', message);
            });
        }
    );
    //------------------Description Functions---------------
    const updateCardDescription = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, data: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log('No Current Board');
            return;
          }
          const found_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardActionType: 'UPDATE',
            description: data,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log(
                  'Fail to update description of card',
                  result.message
                );
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newCard = {
                ...currentBoard.cards[found_idx],
                description: data,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_idx),
                newCard,
                ...currentBoard.cards.slice(found_idx + 1),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to update description of card', message);
            });
        }
    );
    //------------------Label Functions---------------------
    const addLabelIntoCard = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, id: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_label_idx = currentBoard.labels.findIndex(
            (label) => label.labelId === id
          );
          if (found_label_idx === -1) {
            console.log('label having input id is not in board');
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_label = currentBoard.labels[found_label_idx];
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardLabelActionType: 'ADD',
            labelId: id,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to add label into card', result.message);
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newLabels = found_card.labels.concat(found_label);
              const newCard = {
                ...found_card,
                labels: newLabels,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to add label into card', message);
            });
        }
    );
    const removeLabelFromCard = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, id: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const found_label_idx = found_card.labels.findIndex(
            (label) => label.labelId === id
          );
          if (found_card_idx === -1) {
            console.log('selected label is not in card');
            return;
          }
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardLabelActionType: 'DELETE',
            labelId: id,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to remove label in card', result.message);
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newLabels = [
                ...found_card.labels.slice(0, found_label_idx),
                ...found_card.labels.slice(found_label_idx + 1),
              ];
              const newCard = {
                ...found_card,
                labels: newLabels,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to remove label in card', message);
            });
        }
    );
    //------------------Due Date Functions------------------
    const updateCardDueDate = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, date: Date | null) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const date_string = getDateStringForDB(date);
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardActionType: 'UPDATE',
            dueDate: date_string,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update due date of card', result.message);
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newCard = {
                ...found_card,
                dueDate: date ? date_string : null,
              };
              const updateCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updateBoard = {
                ...currentBoard,
                cards: updateCards,
              };
              set(atomCurrentMyBoard, updateBoard);
              // Update atomCurrentCard --------------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to update due date of card', message);
            });
        }
    );
    //------------------Stopwatch Functions-----------------
    const updateCardStopwatch = getCallback(
      ({ set, snapshot }) =>
        async (
          cardId: string,
          userId: string,
          stopwatch: IStopwatch | null
        ) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

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
            cardId: cardId,
            userId: userId,
            cardActionType: 'UPDATE',
            stopwatch: newStopwatch,
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update stopwatch of card', result.message);
                return;
              }
              // Update atomCurrentMyBoard -----------------
              const newCard = {
                ...found_card,
                stopwatch: stopwatch ? newStopwatch : null,
              };
              const updateCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updateBoard = {
                ...currentBoard,
                cards: updateCards,
              };
              set(atomCurrentMyBoard, updateBoard);
              // Update atomCurrentCard --------------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to update stopwatch of card', message);
            });
        }
    );
    //------------------Task Functions----------------------
    const createCardTask = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, data: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardTaskName: data,
            cardTaskActionType: 'ADD',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to create card task', result.message);
                return;
              }
              if (result.outTaskId) {
                // Update atomCurrentMyBoard -----------------
                const newTask = {
                  ...defaultTask,
                  taskId: result.outTaskId,
                  taskName: data,
                };
                const newTasks = found_card.tasks.concat(newTask);
                const newCard = {
                  ...found_card,
                  tasks: newTasks,
                };
                const updatedCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  newCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBaord = {
                  ...currentBoard,
                  cards: updatedCards,
                };
                set(atomCurrentMyBoard, updatedBaord);
                // Update atomCurrentCard --------------------
                if (
                  currentCard !== defaultCard &&
                  currentCard.cardId === cardId
                ) {
                  set(atomCurrentCard, newCard);
                }
              }
            })
            .catch((message) => {
              console.log('Failed to get response', message);
            });
        }
    );
    const updateCardTask = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, id: string, data: any) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          let modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardTaskId: id,
            cardTaskActionType: 'UPDATE',
          };
          if (data.hasOwnProperty('taskName')) {
            modifiedCard.cardTaskName = data.taskName;
          }
          if (data.hasOwnProperty('isCompleted')) {
            modifiedCard.cardTaskIsCompleted = data.isCompleted
              ? 'true'
              : 'false';
          }
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update task of card', result.message);
                return;
              }
              const index = found_card.tasks.findIndex(
                (task) => task.taskId === id
              );
              if (index < 0) {
                console.log('No task having input id');
                return;
              }
              // Update atomCurrentMyBoard -----------------
              let newTask = { ...found_card.tasks[index] };
              if (data.hasOwnProperty('taskName')) {
                newTask.taskName = data.taskName;
              }
              if (data.hasOwnProperty('isCompleted')) {
                newTask.isCompleted = data.isCompleted;
              }
              const newTasks = [
                ...found_card.tasks.slice(0, index),
                newTask,
                ...found_card.tasks.slice(index + 1),
              ];
              const newCard = {
                ...found_card,
                tasks: newTasks,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updatedBaord = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBaord);
              // Update atomCurrentCard --------------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Failed to get response', message);
            });
        }
    );
    const moveCardTask = getCallback(
      ({ set, snapshot }) =>
        async (pick: string, idx: number, userId: string, cardId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          console.log('CardModal: handleTaskMove / ', pick, idx);
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          // Need to update positon of dragging task at first
          const pickingTask = found_card.tasks.filter(
            (task) => task.taskId === pick
          )[0];
          const remainingTasks = found_card.tasks.filter(
            (task) => task.taskId !== pick
          );
          const updatePosition = getNextPosition(remainingTasks, idx);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardTaskPosition: updatePosition,
            cardTaskActionType: 'UPDATE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to move Task : ', result.message);
              } else {
                // Update atomCurrentMyBoard -----------------
                const newTask = {
                  ...pickingTask,
                  position: updatePosition,
                };
                const newTasks = [
                  ...remainingTasks.slice(0, idx),
                  newTask,
                  ...remainingTasks.slice(idx),
                ];
                const newCard = {
                  ...found_card,
                  tasks: newTasks,
                };
                const updatedCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  newCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBaord = {
                  ...currentBoard,
                  cards: updatedCards,
                };
                set(atomCurrentMyBoard, updatedBaord);
                // Update atomCurrentCard --------------------
                if (
                  currentCard !== defaultCard &&
                  currentCard.cardId === cardId
                ) {
                  set(atomCurrentCard, newCard);
                }
              }
            })
            .catch((message) => {
              console.log('Fail to get response', message);
            });
        }
    );
    const deleteCardTask = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, taskId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardTaskId: taskId,
            cardTaskActionType: 'DELETE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log(
                  'Fail to delete selected task in card',
                  result.message
                );
              } else {
                // Update atomCurrentMyBoard -----------------
                const index = found_card.tasks.findIndex(
                  (task) => task.taskId === taskId
                );
                const newTasks = [
                  ...found_card.tasks.slice(0, index),
                  ...found_card.tasks.slice(index + 1),
                ];
                const newCard = {
                  ...found_card,
                  tasks: newTasks,
                };
                const updatedCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  newCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBaord = {
                  ...currentBoard,
                  cards: updatedCards,
                };
                set(atomCurrentMyBoard, updatedBaord);
                // Update atomCurrentCard --------------------
                if (
                  currentCard !== defaultCard &&
                  currentCard.cardId === cardId
                ) {
                  set(atomCurrentCard, newCard);
                }
              }
            })
            .catch((message) => {
              console.log('Failed to get response', message);
            });
        }
    );
    //------------------Attachment Functions----------------
    const createAttachment = getCallback(
      ({ set, snapshot }) =>
        async (cardId: string, userId: string, userName: string, file: any) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

          // Upload File -----------------------------------------------
          const fileData = file.file;
          const fileName = fileData.name;
          const ext_index = fileName.lastIndexOf('.');
          const fileExt = ext_index !== -1 ? fileName.slice(ext_index + 1) : '';
          console.log('File extenstion is : ', fileExt);

          let imageInfo: IImage | null = null;

          const upload = (data: FormData) => {
            const response = apiUploadAttatchment(data);
            response
              .then((result) => {
                if (result.message) {
                  console.log('Fail to upload attachement', result.message);
                } else {
                  // Update atomCurrentMyBoard -----------------
                  const newAttachment: IAttachment = {
                    cardAttachementId: result.outAttachmentId,
                    cardId: cardId,
                    creatorUserId: userId,
                    creatorUserName: userName,
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
                    ...found_card,
                    attachments: [newAttachment, ...found_card.attachments],
                  };
                  const newCards = [
                    ...currentBoard.cards.slice(0, found_card_idx),
                    newCard,
                    ...currentBoard.cards.slice(found_card_idx + 1),
                  ];
                  const updatedBoard = {
                    ...currentBoard,
                    cards: newCards,
                  };
                  set(atomCurrentMyBoard, updatedBoard);
                  // Update atomCurrentCard --------------------
                  if (
                    currentCard !== defaultCard &&
                    currentCard.cardId === cardId
                  ) {
                    set(atomCurrentCard, newCard);
                  }
                }
              })
              .catch((error) => {
                console.log('Fail to get response :', error);
              });
          };

          const formData = new FormData();
          formData.append('cardId', cardId);
          formData.append('fileName', fileName);
          formData.append('fileExt', fileExt);
          formData.append('userId', userId);
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
        }
    );
    const updateAttachment = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, attachId: string, data: any) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          if (data.hasOwnProperty('name')) {
            const modifiedCard: IModifyCard = {
              ...defaultModifyCard,
              cardId: cardId,
              userId: userId,
              cardAttachmentId: attachId,
              cardAttachmentActionType: 'UPDATE',
              cardAttachmentName: data.name,
            };
            const response = apiModifyCard(modifiedCard);
            response
              .then((result) => {
                if (result.message) {
                  console.log('Fail to update attachement', result.message);
                } else {
                  const found_idx = found_card.attachments.findIndex(
                    (item) => item.cardAttachementId === attachId
                  );
                  if (found_idx !== -1) {
                    // Update atomCurrentMyBoard -----------------
                    const newAttachment: IAttachment = {
                      ...found_card.attachments[found_idx],
                      cardAttachmentName: data.name,
                      updatedAt: result.outAttachmentUpdatedAt,
                    };
                    const newAttachments = [
                      ...found_card.attachments.slice(0, found_idx),
                      newAttachment,
                      ...found_card.attachments.slice(found_idx + 1),
                    ];
                    const newCard = {
                      ...found_card,
                      attachments: newAttachments,
                    };
                    const newCards = [
                      ...currentBoard.cards.slice(0, found_card_idx),
                      newCard,
                      ...currentBoard.cards.slice(found_card_idx + 1),
                    ];
                    const updatedBoard = {
                      ...currentBoard,
                      cards: newCards,
                    };
                    set(atomCurrentMyBoard, updatedBoard);
                    // Update atomCurrentCard --------------------
                    if (
                      currentCard !== defaultCard &&
                      currentCard.cardId === cardId
                    ) {
                      set(atomCurrentCard, newCard);
                    }
                  } else {
                    console.log("Couldn't find attachment");
                  }
                }
              })
              .catch((error) => {
                console.log('Fail to get response :', error);
              });
          }
        }
    );
    const deleteAttachment = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, attachId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const found_idx = found_card.attachments.findIndex(
            (item) => item.cardAttachementId === attachId
          );
          if (found_idx !== -1) {
            const found_attachment = found_card.attachments[found_idx];
            const modifiedCard = {
              cardAttachmentId: found_attachment.cardAttachementId,
              userId: userId,
              cardId: cardId,
              fileExt: found_attachment.image?.thumbnailsExtension,
              fileName: found_attachment.fileName,
              dirName: found_attachment.dirName,
            };
            const response = await apiDeleteAttatchment(modifiedCard);
            if (response) {
              if (response.message)
                console.log('Fail to delete attachment file');
              else {
                // Update atomCurrentMyBoard -----------------

                const newAttachments = found_card.attachments.filter(
                  (item) => item.cardAttachementId !== attachId
                );
                const newCard = {
                  ...found_card,
                  attachments: newAttachments,
                };
                const updatedCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  newCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updateCurrentBoard = {
                  ...currentBoard,
                  cards: updatedCards,
                };
                set(atomCurrentMyBoard, updateCurrentBoard);
                // Update atomCurrentCard -----------------
                if (
                  currentCard !== defaultCard &&
                  currentCard.cardId === cardId
                ) {
                  set(atomCurrentCard, newCard);
                }
              }
            }
          }
        }
    );
    //------------------Comment Functions------------------
    const createComment = getCallback(
      ({ set, snapshot }) =>
        async (
          userId: string,
          userName: string,
          cardId: string,
          newText: string
        ) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardCommentText: newText,
            cardCommentActionType: 'ADD',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to create comment in card', result.message);
              } else {
                // Update atomCurrentMyBoard -----------------
                if (result.outCommentId) {
                  const newComment = {
                    ...defaultComment,
                    commentId: result.outActionId,
                    cardId: cardId,
                    userId: userId,
                    userName: userName,
                    text: newText,
                    createdAt: result.outCommentCreatedAt,
                  };
                  const newComments = [newComment, ...found_card.comments];
                  const newCard = {
                    ...found_card,
                    comments: newComments,
                  };
                  const updatedCards = [
                    ...currentBoard.cards.slice(0, found_card_idx),
                    newCard,
                    ...currentBoard.cards.slice(found_card_idx + 1),
                  ];
                  const updateCurrentBoard = {
                    ...currentBoard,
                    cards: updatedCards,
                  };
                  set(atomCurrentMyBoard, updateCurrentBoard);
                  // Update atomCurrentCard -----------------
                  if (
                    currentCard !== defaultCard &&
                    currentCard.cardId === cardId
                  ) {
                    set(atomCurrentCard, newCard);
                  }
                }
              }
            })
            .catch((message) => {
              console.log('Failed to get response', message);
            });

          // Update atomCurrentCard --------------------
        }
    );
    const updateComment = getCallback(
      ({ set, snapshot }) =>
        async (
          userId: string,
          cardId: string,
          commentId: string,
          newText: string
        ) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

          // Update atomCurrentMyBoard -----------------
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardCommentId: commentId,
            cardCommentText: newText,
            cardCommentActionType: 'UPDATE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update comment of card', result.message);
              } else {
                const index = found_card.comments.findIndex(
                  (comment) => comment.commentId === commentId
                );

                if (index < 0) return;

                const newComment = {
                  ...found_card.comments[index],
                  text: newText,
                  updatedAt: result.outCommentUpdatedAt,
                };
                const newComments = [
                  ...found_card.comments.slice(0, index),
                  newComment,
                  ...found_card.comments.slice(index + 1),
                ];
                const newCard = {
                  ...found_card,
                  comments: newComments,
                };
                const updatedCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  newCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBoard = {
                  ...currentBoard,
                  cards: updatedCards,
                };
                set(atomCurrentMyBoard, updatedBoard);
                // Update atomCurrentCard -----------------
                if (
                  currentCard !== defaultCard &&
                  currentCard.cardId === cardId
                ) {
                  set(atomCurrentCard, newCard);
                }
              }
            })
            .catch((message) => {
              console.log('Fail to update task of card', message);
            });
        }
    );
    const deleteComment = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, commentId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

          // Update atomCurrentMyBoard -----------------
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardCommentId: commentId,
            cardCommentActionType: 'DELETE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to remove label in card', result.message);
                return;
              }
              const newComments = found_card.comments.filter(
                (comment) => comment.commentId !== commentId
              );

              const newCard = {
                ...found_card,
                comments: newComments,
              };
              const updatedCards = [
                ...currentBoard.cards.slice(0, found_card_idx),
                newCard,
                ...currentBoard.cards.slice(found_card_idx + 1),
              ];
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, newCard);
              }
            })
            .catch((message) => {
              console.log('Fail to delete task of card', message);
            });
          // Update atomCurrentCard --------------------
        }
    );
    //------------------Card Functions---------------------
    const moveCard = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string, newlistId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return false;
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
            return false;
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

          // Update atomCurrentMyBoard -----------------
          const modifiedCard: IModifyCard = {
            ...defaultModifyCard,
            userId: userId,
            cardId: cardId,
            listId: newlistId,
            cardActionType: 'MOVE',
          };
          const response = apiModifyCard(modifiedCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to move card', result.message);
                return false;
              }
              const found_list_idx = currentBoard.lists.findIndex(
                (list) => list.listId === newlistId
              );
              if (found_list_idx === -1) {
                const updateCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBoard = {
                  ...currentBoard,
                  cards: updateCards,
                };
                set(atomCurrentMyBoard, updatedBoard);
              } else {
                const updateCard = {
                  ...currentBoard.cards[found_card_idx],
                  listId: newlistId,
                };
                const updateCards = [
                  ...currentBoard.cards.slice(0, found_card_idx),
                  updateCard,
                  ...currentBoard.cards.slice(found_card_idx + 1),
                ];
                const updatedBoard = {
                  ...currentBoard,
                  cards: updateCards,
                };
                set(atomCurrentMyBoard, updatedBoard);
              }
            })
            .catch((message) => {
              console.log('Fail to get response', message);
              return false;
            });
        }
    );
    const deleteCard = getCallback(
      ({ set, snapshot }) =>
        async (userId: string, cardId: string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
          }
          const found_card_idx = currentBoard.cards.findIndex(
            (card) => card.cardId === cardId
          );
          if (found_card_idx === -1) {
            console.log('selected card is not in board');
          }
          const found_card = currentBoard.cards[found_card_idx];
          const currentCard = await snapshot.getPromise(atomCurrentCard);

          // Update atomCurrentMyBoard -----------------
          const updateCard: IModifyCard = {
            ...defaultModifyCard,
            cardId: cardId,
            userId: userId,
            cardActionType: 'DELETE',
          };
          const response = apiModifyCard(updateCard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to delete card', result.message);
                return;
              }
              const updatedCards = currentBoard.cards.filter(
                (card) => card.cardId !== cardId
              );
              const updatedBoard = {
                ...currentBoard,
                cards: updatedCards,
              };
              set(atomCurrentMyBoard, updatedBoard);
              // Update atomCurrentCard -----------------
              if (
                currentCard !== defaultCard &&
                currentCard.cardId === cardId
              ) {
                set(atomCurrentCard, defaultCard);
              }
            })
            .catch((message) => {
              console.log('Fail to get response', message);
            });
        }
    );
    return {
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
    };
  },
});
