import { selector } from 'recoil';
import {
  atomCurrentMyBoard,
  defaultCurrentMyBoard,
  defaultModifyBoard,
  IModifyBoard,
} from '../atoms/atomsBoard';
import { apiModifyBoard } from '../api/board';
import Paths from '../constants/Paths';
import { atomCurrentCard, defaultCard } from '../atoms/atomCard';
const BASE_PATH = Paths.BASE_PATH;

export const BoardRepository = selector({
  key: 'BoardRepository',
  get: ({ getCallback }) => {
    //------------------Label Functions------------------
    const createLabel = getCallback(
      ({ set, snapshot }) =>
        async (data: { name: string | null; color: string }, userId:string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          };
          const modifiedBoard: IModifyBoard = {
            ...defaultModifyBoard,
            boardId: currentBoard.boardId,
            userId: userId,
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
                // Update atomCurrentMyBoard -----------------
                const newLabel = {
                  boardId: currentBoard.boardId,
                  labelId: result.outLabelId,
                  labelName: data.name ? data.name : '',
                  color: data.color,
                  position: '',
                };
                const newLabels = currentBoard.labels.concat(newLabel);
                const updateBoard = {
                  ...currentBoard,
                  labels: newLabels,
                };
                set(atomCurrentMyBoard, updateBoard);
                // Update atomCurrentCard -----------------
                // Nothing!
              };
            })
            .catch((message) => {
              console.log('Fail to add label', message);
            });
        }
    );
    const updateLabel = getCallback(
      ({ set, snapshot }) =>
        async (data: { id: string; name?: string; color?: string }, userId:string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          };
          const found_idx = currentBoard.labels.findIndex(
            (label) => label.labelId === data.id
          );
          if (found_idx === -1) {
            console.log('No label with input id');
            return;
          };
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const found_label = currentBoard.labels[found_idx];
          const modifiedBoard: IModifyBoard = {
            ...defaultModifyBoard,
            boardId: currentBoard.boardId,
            userId: userId,
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
                // Update atomCurrentMyBoard -----------------
                let newLabel = found_label;
                if (data.name) newLabel.labelName = data.name;
                if (data.color) newLabel.color = data.color;
                const newLabels = [
                  ...currentBoard.labels.slice(0, found_idx),
                  newLabel,
                  ...currentBoard.labels.slice(found_idx + 1),
                ];
                const updatedBoard = {
                  ...currentBoard,
                  labels: newLabels,
                };
                set(atomCurrentMyBoard, updatedBoard);
                // Update atomCurrentCard -----------------
                if (currentCard !== defaultCard) {
                  const found_label_idx = currentCard.labels.findIndex(
                    (label) => label.labelId === data.id
                  );
                  if (found_label_idx !== -1) {
                    const newLabelsInCard = [
                      ...currentCard.labels.slice(0, found_label_idx),
                      newLabel,
                      ...currentCard.labels.slice(found_label_idx),
                    ];
                    const updatedCard = {
                      ...currentCard,
                      labels: newLabelsInCard,
                    };
                    set(atomCurrentCard, updatedCard);
                  };
                };
              };
            })
            .catch((message) => {
              console.log('Fail to update label', message);
            });
        }
    );
    const deleteLabel = getCallback(
      ({ set, snapshot }) =>
        async (id: string, userId:string) => {
          const currentBoard = await snapshot.getPromise(atomCurrentMyBoard);
          if (currentBoard === defaultCurrentMyBoard) {
            console.log("Current Board doesn't have data");
            return;
          }
          const found_idx_board = currentBoard.labels.findIndex(
            (label) => label.labelId === id
          );
          if (found_idx_board === -1) {
            console.log('No label in board');
            return;
          }
          const currentCard = await snapshot.getPromise(atomCurrentCard);
          const modifiedBoard: IModifyBoard = {
            ...defaultModifyBoard,
            boardId: currentBoard.boardId,
            userId: userId,
            boardLabelActionType: 'DELETE',
            labelId: id,
          };
          const response = apiModifyBoard(modifiedBoard);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to delete label', result.message);
              } else {
                // Update atomCurrentMyBoard -----------------
                const newLabels = [
                  ...currentBoard.labels.slice(0, found_idx_board),
                  ...currentBoard.labels.slice(found_idx_board + 1),
                ];
                const updatedBoard = {
                  ...currentBoard,
                  labels: newLabels,
                };
                set(atomCurrentMyBoard, updatedBoard);
                // Update atomCurrentCard --------------------
                if (currentCard !== defaultCard) {
                  const found_idx_card = currentCard.labels.findIndex(
                    (label) => label.labelId === id
                  );
                  if (found_idx_card !== -1) {
                    const newCard = {
                      ...currentCard,
                      labels: newLabels,
                    };
                    set(atomCurrentCard, newCard);
                  };
                };
              };
            })
            .catch((message) => {
              console.log('Fail to delete label', message);
            });
        }
    );
    return {
      createLabel,
      updateLabel,
      deleteLabel,
    };
  },
});
