import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {useQuery} from 'react-query';
import {useCookies} from "react-cookie";
import {useHistory} from "react-router-dom";

import {apiGetProjectbyId} from "../../api/project";
import {  IProject, atomCurrentProject, projectSelector, 
        IModifyProject, defaultModifyProject , projectSetter} from '../../atoms/atomsProject';
import {apiPostProjects} from "../../api/project";
import ManagersPane from './ManagersPane';
import BackgroundPane from './BackgroundPane';
import GeneralPane from './GeneralPane';

import Path from '../../constants/Paths';
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
  setCurrent: (value:boolean) => void;
  projectName : string;
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
    projectName,
    setCurrent,
    projectId,
    onClose,
  }:IProjectSettingsModal) => {
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [currentProject, setCurrentProject] = useRecoilState(atomCurrentProject);


    const currentProject1 = useRecoilValue(projectSelector);  // 내 전체 프로젝트 중에 
    const currentSetProject1 = useSetRecoilState(projectSetter);
    const currentProject2 = currentProject1(projectId)[0];    // 지금 프로젝트를 가지고 옴.

    const [projectQuery, setProejctQuery] = useState(false);

    const history = useHistory();

     // atomCurrentProject 세팅 , 이후에 Membership에서 사용
     useEffect(()=>{
      setProejctQuery(true);
     },[projectId, currentProject2, currentProject, setCurrentProject]);
  
     const {isLoading, data, isSuccess} = useQuery<IProject>(["currentProject", projectId], ()=>apiGetProjectbyId(projectId),{
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
      // 닫아야 하는데. 
      onClose(false);
      setCurrent(false);
      history.push(Path.ROOT); 
    },[]); 

    const onProjectUpdate  = useCallback(async (name:any) => {

      const moddifyProject:IModifyProject = {...defaultModifyProject, 
        creatorUserId:cookies.UserId, projectActionType:'UPDATE', 
        projectName:name.projectName, projectId:projectId};
        try{
            const response:any = await apiPostProjects(moddifyProject);

            if(response){
                if(!response.message){
                  onClose(false);
                  //recoil 추가 
                  const updatedProject:IProject = {...currentProject2, projectName:name.projectName};
                  currentSetProject1([updatedProject])
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
        render: () => <GeneralPane projectId={projectId} 
          isAdmin={currentProject2.isAdmin}
          role={currentProject2.role}
          name={currentProject2?.projectName} 
          onUpdate={onProjectUpdate} 
          onDelete={onProjectDelete} />,
      },
      {
        menuItem: t('common.managers', {
          context: 'title',
        }),
        render: () => (
          <ManagersPane
            projectId = {projectId}
            isAdmin={currentProject2.isAdmin}
            role={currentProject2.role}
            managers={currentProject2?.members}
            allUsers={currentProject2?.userPools}
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
    if (currentProject2.projectId === projectId) {
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
    );}else{
      return null;
    }
  }

export default ProjectSettingsModal;
