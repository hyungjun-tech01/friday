import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';
import {useRecoilValue} from 'recoil';

import ManagersPane from './ManagersPane';
import BackgroundPane from './BackgroundPane';
import GeneralPane from './GeneralPane';

import {IUser, allUserSelector} from "../../atoms/atomsUser";
import { defaultBoardUser, IBoardUser } from '../../atoms/atomsBoard';
import {  IProject, projectSelector } from '../../atoms/atomsProject';
import userEvent from '@testing-library/user-event';

interface  IProjectSettingsModal{
  // name:string;
  // background:string;
  // backgroundImage:string;
  // isBackgroundImageUpdating:()=>void;
  // managers:IUser[];
  // onUpdate: (newBackground:any)=>void;
  // onBackgroundImageUpdate: ()=>void;
  // onDelete:()=>void;
  // onManagerCreate:()=>void;
  // onManagerDelete:()=>void;
  projectId:string;
  onClose:(value:boolean)=>void;
}
 
const ProjectSettingsModal = 
  ({
    // name,
    // background,
    // backgroundImage,
    // isBackgroundImageUpdating,
    // managers,
    // onUpdate,
    // onBackgroundImageUpdate,
    // onDelete,
    // onManagerCreate,
    // onManagerDelete,
    projectId,
    onClose,
  }:IProjectSettingsModal) => {
    const [t] = useTranslation();
    //const allUsers = useRecoilValue(allUserSelector);
    //const allUsersTransferToBoardUsers = allUsers.map(user=>({...defaultBoardUser, userId:user.userId, userName:user.userName, userEmail:user.email, avatarUrl:user.avatar}));
    const selectProject = useRecoilValue(projectSelector); 
    const currentProject = selectProject(projectId)[0];
    //console.log('ProjectSeetingModal',projectId, currentProject, allUsersTransferToBoardUsers);
    //const managersTransferToBoardUsers = currentProject.members.map(user=>({...defaultBoardUser, userId:user.userId, userName:user.name, userEmail:user.userEmail, avatarUrl:user.avatar}));
    //console.log('managersTransferToBoardUsers',managersTransferToBoardUsers);
    const handleBackgroundUpdate = useCallback(
       (newBackground:any) => {
      //   onUpdate({
      //     background: newBackground,
      //   });
       },[]
      // [onUpdate],
    );

    const handleBackgroundImageDelete = useCallback(() => {
      // onUpdate({
      //   backgroundImage: null,
      // });
    }, []
    //[onUpdate]
    );

    const onManagerCreate  = useCallback(() => {
    },[]); 
    const onManagerDelete  = useCallback(() => {
    },[]); 

    const onHandleClose  = useCallback(() => {
      onClose(false);
    },[]); 
    
    const panes = [
      // {
      //   menuItem: t('common.general', {
      //     context: 'title',
      //   }),
      //   render: () => <GeneralPane name={name} onUpdate={onUpdate} onDelete={onDelete} />,
      // },
      {
        menuItem: t('common.managers', {
          context: 'title',
        }),
        render: () => (
          <ManagersPane
            managers={currentProject.members}
            allUsers={currentProject.userPools}
            onCreate={onManagerCreate}
            onDelete={onManagerDelete}
          />
        ),
      },
      // {
      //   menuItem: t('common.background', {
      //     context: 'title',
      //   }),
      //   render: () => (
      //     <BackgroundPane
      //       item={background}
      //       imageCoverUrl={backgroundImage && backgroundImage.coverUrl}
      //       isImageUpdating={isBackgroundImageUpdating}
      //       onUpdate={handleBackgroundUpdate}
      //       onImageUpdate={onBackgroundImageUpdate}
      //       onImageDelete={handleBackgroundImageDelete}
      //     />
      //   ),
      // },
    ];

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onHandleClose}>
        <Modal.Content>
          <Tab
            menu={{
              secondary: true,
              pointing: true,
            }}
            panes={panes}
          />
        </Modal.Content>
      </Modal>
    );
  }

export default ProjectSettingsModal;
