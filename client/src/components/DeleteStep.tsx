import React, {useCallback} from 'react';
import { Button , Popup as SemanticUIPopup} from 'semantic-ui-react';
import {useSetRecoilState, useRecoilValue} from "recoil";
import {useCookies} from "react-cookie";

import {IBoardUser, usersPoolSelector, 
  IModifyBoard, defaultModifyBoard, 
  atomCurrentMyBoard, 
  usersDeleter,
  } from "../atoms/atomsBoard";
import {IModifyProject, defaultModifyProject} from "../atoms/atomsProject";
import {atomCurrentProject, projectUsersDeleter, projectUsersPoolSelector} from "../atoms/atomsProject";
import {apiModifyBoard} from "../api/board";
import {apiPostProjects} from "../api/project";
import styles from '../scss/DeleteStep.module.scss';

interface IDeleteStep{
    boardId : string;
    projectId :string;
    userId : string;
    title : string;
    content : string;
    buttonContent : string;
    onConfirm : (userId:string, delboardId:string)=>void;
    onBack : () => void;
}
const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#9e3f08';
    e.currentTarget.style.color = 'white';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#db570a';
    e.currentTarget.style.color = 'white';
  };
  
function DeleteStep ({ boardId, projectId, userId, title, content, buttonContent, onConfirm, onBack }:IDeleteStep) {
  const user = useRecoilValue(usersDeleter(userId));
  const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
  const currentBoard = useRecoilValue(atomCurrentMyBoard);
  const boardUser = currentBoard.users;
  const setUsersPool = useSetRecoilState(usersPoolSelector);

  const currentProject = useRecoilValue(atomCurrentProject);
  const projectUsers = currentProject.members;
  const setProjectUsersPool = useSetRecoilState(projectUsersPoolSelector);
  //const delProject = useRecoilValue(projectUsersDeleter(userId));

  
  const deleteUser = useSetRecoilState(usersDeleter(userId));

  const handleUserDelete = useCallback(async (userId:string, delboardId:string) => {
    console.log('delete user : ', userId, boardUser, projectId);
 
    if(projectId === ""){
    // server 처리 
    const boardAA : IModifyBoard= {...defaultModifyBoard, boardMembershipActionType:'DELETE', 
        boardMembershipUserId:userId, 
        boardId:delboardId, userId:cookies.UserId};

    const response = await apiModifyBoard(boardAA);
    if(response){
        if(response.boardId){ 
          const delUser = boardUser.filter((user:any) => user.userId === userId)[0];
          deleteUser(user);
          const newuser:IBoardUser = {...delUser, 
            role:null,
            canEdit:null,
          }
          setUsersPool([newuser]);
          onConfirm(userId, boardId);
        }else if(response.message){
            console.log('Fail to     delete card', response.message);
            //    setDeleteStep(true);  // 에러 response 표현 해 주어야 하나??
        }else{
            //    setDeleteStep(true);
        }
      }
    }else{
      // server 처리 
      console.log('del user', projectId, userId);
      const projectAA : IModifyProject= 
          {...defaultModifyProject, 
            projectActionType:'DELETE MANAGER', 
            managerId:userId, 
            projectId:projectId, 
            creatorUserId:cookies.UserId};
      const response = await apiPostProjects(projectAA);
      if(response){
        console.log('del user', response);
        if(response.projectId){ 
          console.log('del user');
          const delProjectUser = projectUsers.filter((user:any) => user.userId === userId)[0];
          projectUsersDeleter(userId);
          const newuser:IBoardUser = {...delProjectUser, 
            role:null,
            canEdit:null,
          } 
          setProjectUsersPool([newuser]);
          onConfirm(userId, projectId);

        }else if(response.message){
            console.log('Fail to     delete card', response.message);
            //    setDeleteStep(true);  // 에러 response 표현 해 주어야 하나??
        }else{
            //    setDeleteStep(true);
        }
      }
    }
},[boardId, boardUser, cookies.UserId, deleteUser, onConfirm, setUsersPool, user, projectId, projectUsers,setProjectUsersPool]);
    return (
        <div className={styles.overlay} > 
            <div className={styles.modal} >
            <SemanticUIPopup.Header className={styles.wrapper}>
                {onBack && <Button icon="angle left" onClick={onBack} className={styles.backButton} />}
                <div className={styles.popupcontent}>{title}</div>
            </SemanticUIPopup.Header>
            <div>
                    <div className={styles.content}>{content}</div>
                    <Button fluid positive 
                     style = {{
                        background : '#db570a',
                        color: 'white',
                        fontWeight: 'bold',
                        marginTop: '8px',
                        padding: '6px 11px',
                        textAlign: 'center',
                        transition: 'none',
                      }} 
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}                      
                    content={buttonContent} onClick={()=>handleUserDelete(userId, boardId)} />
              </div>
            </div>  
        </div>
      );
}

export default DeleteStep;
