import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {useQuery} from 'react-query';

import {apiGetProjectbyId} from "../../api/project";
import {  IProject, atomCurrentProject, projectSelector } from '../../atoms/atomsProject';

import ManagersPane from './ManagersPane';
import BackgroundPane from './BackgroundPane';
import GeneralPane from './GeneralPane';

import {IUser, allUserSelector} from "../../atoms/atomsUser";
import { defaultBoardUser, IBoardUser } from '../../atoms/atomsBoard';


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
    const [currentProject, setCurrentProject] = useRecoilState(atomCurrentProject);
    const currentProject1 = useRecoilValue(projectSelector);
    const currentProject2 = currentProject1(projectId)[0];
    const [projectQuery, setProejctQuery] = useState(false);
    useEffect(()=>{
      setProejctQuery(true);
    },[projectId, setCurrentProject]);
  
    const {isLoading, data, isSuccess} = useQuery<IProject>(["currentMyProject", projectId], ()=>apiGetProjectbyId(projectId),{
      onSuccess: data => {
         setCurrentProject(data);   // use Query 에서 atom에 set
      },
      enabled : projectQuery
    }
  );
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

    const onProjectDelete  = useCallback(() => {
    },[]); 

    const onProjectUpdate  = useCallback((name:any) => {
      console.log('onProjectUpdate', projectId, name);    
    },[]); 

    const onHandleClose  = useCallback(() => {
      onClose(false);
    },[]); 
    
    const panes = [
      {
        menuItem: t('common.general', {
          context: 'title',
        }),
        render: () => <GeneralPane name={currentProject2?.projectName} onUpdate={onProjectUpdate} onDelete={onProjectDelete} />,
      },
      {
        menuItem: t('common.managers', {
          context: 'title',
        }),
        render: () => (
          <ManagersPane
            projectId = {projectId}
            managers={currentProject2.members}
            allUsers={currentProject2.userPools}
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
