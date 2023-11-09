import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {useQuery} from 'react-query';
import {useCookies} from "react-cookie";

import {apiGetProjectbyId} from "../../api/project";
import {  IProject, atomCurrentProject, projectSelector, 
        IModifyProject, defaultModifyProject } from '../../atoms/atomsProject';
import {apiPostProjects} from "../../api/project";
import ManagersPane from './ManagersPane';
import BackgroundPane from './BackgroundPane';
import GeneralPane from './GeneralPane';

import {IUser, allUserSelector} from "../../atoms/atomsUser";
import { defaultBoardUser, IBoardUser } from '../../atoms/atomsBoard';


import userEvent from '@testing-library/user-event';
import { stringify } from 'querystring';

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
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [currentProject, setCurrentProject] = useRecoilState(atomCurrentProject);


    const currentProject1 = useRecoilValue(projectSelector);
    const currentSetProject1 = useSetRecoilState(projectSelector);
    const currentProject2 = currentProject1(projectId)[0];

    const [projectQuery, setProejctQuery] = useState(false);
    useEffect(()=>{
     //setProejctQuery(true);
      setCurrentProject(currentProject2);
      console.log('currentProject', currentProject);
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

    const onProjectUpdate  = useCallback(async (name:any) => {
      console.log('onProjectUpdate', projectId, name);    

      const moddifyProject:IModifyProject = {...defaultModifyProject, 
        creatorUserId:cookies.UserId, projectActionType:'UPDATE', 
        projectName:name.projectName, projectId:projectId};
        try{
            const response:any = await apiPostProjects(moddifyProject);

            if(response){
                if(!response.message){
                  onClose(false);
                  //recoil 추가 
                  const updatedProject = {...currentProject, projectName:name.projectName};
                  setCurrentProject(updatedProject);
                 // projectSetUsers([newuser]);
                 // projectSetUsersPool([newuser]);
                 console.log("success", response);
                }else{
                    console.log("response", response.message);
                }
            }
            
          }catch(err){
            console.error(err);
          }


    },[]); 

    const onHandleClose  = useCallback(() => {
      onClose(false);
    },[]); 
    
    const panes = [
      {
        menuItem: t('common.general', {
          context: 'title',
        }),
        render: () => <GeneralPane name={currentProject?.projectName} onUpdate={onProjectUpdate} onDelete={onProjectDelete} />,
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
