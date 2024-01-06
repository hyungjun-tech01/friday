import React from 'react';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form, Popup } from 'semantic-ui-react';
import { apiGetLists } from '../api/list';
import { IProjectToBoards, atomProjectsToLists } from '../atoms/atomsProject';
import { IList } from '../atoms/atomsList';
import CustomPopupHeader from '../lib/ui/CustomPopupHeader';

import styles from '../scss/CardMovePopup.module.scss';

interface ICardMovePopupProps {
  defaultPath: {
    projectId: string | null;
    boardId: string | null;
    listId: string | null;
  };
  onMove: (listId: string) => void;
  // onTransfer: () => void;
  // onBoardFetch: () => void;
  onBack?: () => void;
  onClose: () => void;
}

const CardMovePopup = ({
  defaultPath,
  onMove,
  // onTransfer,
  // onBoardFetch,
  onBack,
  onClose,
}: ICardMovePopupProps) => {
  const [t] = useTranslation();
  const [cardPath, setCardPath] = useState({
    ...defaultPath,
  });
  const [projectsToLists, setProjectsToLists] = useRecoilState(atomProjectsToLists);

  const selectedProject = useMemo(
    () =>
      projectsToLists.find((project) => project.id === cardPath.projectId) ||
      null,
    [projectsToLists, cardPath.projectId]
  );

  const selectedBoard = useMemo(
    () =>
      (selectedProject &&
        selectedProject.boards.find(
          (board) => board.id === cardPath.boardId
        )) ||
      null,
    [selectedProject, cardPath.boardId]
  );

  const selectedList = useMemo(
    () =>
      (selectedBoard &&
        selectedBoard.lists.find((list) => list.id === cardPath.listId)) ||
      null,
    [selectedBoard, cardPath.listId]
  );

  const handleProjectIdChange = useCallback((event: any, data: any) => {
    setCardPath((prev) => ({
      ...prev,
      projectId: data.value,
    }));
  }, [cardPath]);

  const handleBoardIdChange = useCallback((event: any, data: any) => {
    if (selectedProject && selectedProject.boards) {
      const found = selectedProject.boards.find(
        (board) => board.id === data.value
      );
      if (found?.isFetching === null) {
        const resp = apiGetLists(data.value);
        resp
          .then((res) => {
            if (res.message) {
              console.log(
                'Fail to get lists of board : ',
                found.name,
                res.message
              );
            } else {
              const updateLists = res.map((list: IList) => ({
                id: list.listId,
                name: list.listName,
              }));
              const udpateBoard = {
                id: found.id,
                name: found.name,
                lists: updateLists,
                isFetching: false,
              };
              const found_board_idx = selectedProject.boards.findIndex((board) => board.id === data.value);
              const updateBoards = [
                ...selectedProject.boards.slice(0, found_board_idx),
                udpateBoard,
                ...selectedProject.boards.slice(found_board_idx + 1)
              ];
              const updateProject: IProjectToBoards = {
                ...selectedProject,
                boards: updateBoards,
              };
              const found_idx = projectsToLists.findIndex(
                (project) => project.id === cardPath.projectId
              );
              if (found_idx !== -1) {
                const updateProjects: IProjectToBoards[] = [
                  ...projectsToLists.slice(0, found_idx),
                  updateProject,
                  ...projectsToLists.slice(found_idx + 1),
                ];
                setProjectsToLists(updateProjects);
              }
            }
          })
          .catch((error) => {
            console.log('Fail to get lists of board : ', found.name, error);
          });
      }
    }
    setCardPath((prev) => ({
      ...prev,
      boardId: data.value,
    }));
  }, [cardPath.projectId, projectsToLists, selectedProject, setProjectsToLists]);

  const handleListIdChange = useCallback((event: any, data: any) => {
    setCardPath((prev) => ({
      ...prev,
      listId: data.value,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (
      selectedBoard?.id !== defaultPath.boardId ||
      selectedList?.id !== defaultPath.listId
    ) {
      if (selectedList) onMove(selectedList.id);
    }

    onClose();
  }, [defaultPath.boardId, defaultPath.listId, onClose, onMove, selectedBoard?.id, selectedList]);

  useEffect(() => {
    if(selectedBoard?.isFetching === null) {
      const response = apiGetLists(selectedBoard.id);
      response
        .then((result) => {
          if(result.message) {
            console.log("CardMovePopup / apiGetLists :", result.message);
          } else {
            const updateLists = result.map((list: IList) => ({id: list.listId, name: list.listName}));
            const found_project_idx = projectsToLists.findIndex((project) => project.id === cardPath.projectId);
            if(found_project_idx !== -1) {
              const gotProject = projectsToLists[found_project_idx];
              const found_board_idx = gotProject.boards.findIndex((board) => board.id === cardPath.boardId);
              if(found_board_idx !== -1) {
                const gotBoard = gotProject.boards[found_board_idx];
                const updateBoard = {
                  ...gotBoard,
                  lists: updateLists,
                  isFetching: false
                };
                const updateBoards = [
                  ...gotProject.boards.slice(0, found_board_idx),
                  updateBoard,
                  ...gotProject.boards.slice(found_board_idx + 1)
                ];
                const updateProject = {
                  ...gotProject,
                  boards: updateBoards
                };
                const updateProjects = [
                  ...projectsToLists.slice(0, found_project_idx),
                  updateProject,
                  ...projectsToLists.slice(found_project_idx + 1)
                ];
                setProjectsToLists(updateProjects);
              };
            };
          };
        })
        .catch((error) => {
          console.log("CardMovePopup / apiGetLists :", error);
        });
    }
  }, [selectedBoard]);

  return (
    <>
      <CustomPopupHeader onBack={onBack}>
        {t('common.moveCard', {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.project')}</div>
          <Dropdown
            fluid
            selection
            name="projectId"
            options={projectsToLists.map((project) => ({
              text: project.name,
              value: project.id,
            }))}
            value={selectedProject ? selectedProject.id : undefined}
            placeholder={
              projectsToLists.length === 0
                ? t('common.noProjects')
                : t('common.selectProject')
            }
            disabled={projectsToLists.length === 0}
            className={styles.field}
            onChange={handleProjectIdChange}
          />
          {selectedProject && (
            <>
              <div className={styles.text}>{t('common.board')}</div>
              <Dropdown
                fluid
                selection
                name="boardId"
                options={selectedProject.boards.map((board) => ({
                  text: board.name,
                  value: board.id,
                }))}
                value={selectedBoard ? selectedBoard.id : undefined}
                placeholder={
                  selectedProject.boards.length === 0
                    ? t('common.noBoards')
                    : t('common.selectBoard')
                }
                disabled={selectedProject.boards.length === 0}
                className={styles.field}
                onChange={handleBoardIdChange}
              />
            </>
          )}
          {selectedBoard && (
            <>
              <div className={styles.text}>{t('common.list')}</div>
              <Dropdown
                fluid
                selection
                name="listId"
                options={selectedBoard.lists.map((list) => ({
                  text: list.name,
                  value: list.id,
                }))}
                value={selectedList ? selectedList.id : undefined}
                placeholder={
                  selectedBoard.isFetching === false &&
                  selectedBoard.lists.length === 0
                    ? t('common.noLists')
                    : t('common.selectList')
                }
                loading={selectedBoard.isFetching !== false}
                disabled={
                  selectedBoard.isFetching !== false ||
                  selectedBoard.lists.length === 0
                }
                className={styles.field}
                onChange={handleListIdChange}
              />
            </>
          )}
          <Button
            positive
            content={t('action.move')}
            disabled={
              (selectedBoard && selectedBoard.isFetching !== false) ||
              !selectedList
            }
          />
        </Form>
      </Popup.Content>
    </>
  );
};

export default CardMovePopup;
