import {useTranslation} from "react-i18next";
import {useCookies} from "react-cookie";
import {Button} from "semantic-ui-react";
import {useSetRecoilState, useRecoilValue} from "recoil";


import {IBoardUser, usersPoolSelector, 
       IModifyBoard, defaultModifyBoard, 
       usersSelector, atomCurrentMyBoard
       } from "../../atoms/atomsBoard";
import {IModifyProject, defaultModifyProject, atomCurrentProject, 
    projectUsersPoolSelector, projectUsersSelector, projectUsersUpdator} from "../../atoms/atomsProject";
import styles from "./Membership.module.scss";
import User from "./User";
import React, {useCallback, useState} from "react";
import DeleteStep from "../DeleteStep";
import {apiModifyBoard} from "../../api/board";
import {apiPostProjects} from "../../api/project";
import  usePopup  from '../../lib/hook/use-popup';
import AddStep from "./AddStep";
import ActionsStep from "./ActionsStep";


import permissionsSelectStep from "../BoardMembershipPermissionsSelectStep";
import projectPermissionsSelectStep from "../ProjectMembershipPermissionsSelectStep";

interface IMembershipProps {
    boardId: string|null;
    canEdit : boolean;
    members?: IBoardUser[];
    allUsers?:IBoardUser[];
    isMemberLoading : boolean;
    setIsMemberLoading: (value:boolean) => void;
    projectId : string|null; // 프로젝트에서도 멤버 관리 함. ㅠㅠ 
  }
interface IboardMemberActionUserId{
    userId:string;
    userName:string;
    avatarUrl:string;
    userEmail:string;
    role : string;
    canEdit:boolean;
    positionX:number;
    positionY:number;
}
function Membership({boardId, canEdit, members, allUsers, isMemberLoading, setIsMemberLoading, projectId}:IMembershipProps){

    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [positions, setPositions] = useState({positionX:-1, positionY:-1});

    const onAddMemberPopup = (event:React.MouseEvent<HTMLButtonElement>)=>{
        setPositions({positionX:event.pageX,  positionY:event.pageY});
        setOnAddPopup(true);
    }
    const AddPopup = usePopup(AddStep);
    const ActionsPopup = usePopup(ActionsStep);

    const [onAddPopup, setOnAddPopup] = useState(false);
    // userId 와 현재 클릭한 포지션 획득 
    const [boardMemberActionUserId, setBoardMemberActionUserId] = useState<IboardMemberActionUserId>({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });
    // 사용자 삭제 Modal 
    const [deleteStep, setDeleteStep]  = useState(false);

    const currentBoard = useRecoilValue(atomCurrentMyBoard);
    const boardUser = currentBoard.users;
    const setUser = useSetRecoilState(usersSelector);

    const usersPool =  useRecoilValue(usersPoolSelector);
    const setUsersPool = useSetRecoilState(usersPoolSelector);

    // project 
    const selectProject = useRecoilValue(atomCurrentProject); 
    const projectUsersPool =  selectProject.userPools; // useRecoilValue(projectUsersPoolSelector);
    const projectUsers =  useRecoilValue(projectUsersSelector); // selectProject.members; // useRecoilValue(projectUsersPoolSelector);
    const projectSetUsersPool = useSetRecoilState(projectUsersPoolSelector);
    const projectSetUsers = useSetRecoilState(projectUsersSelector);
    const proejctUsersUpdate = useSetRecoilState(projectUsersUpdator);

    const onCreate = async (data:IBoardUser)=>{
      //  setBoardMemberAction(true);

        // server 처리 할 것 .
        const board : IModifyBoard= {...defaultModifyBoard, boardMembershipActionType:'ADD', boardMembershipUserId:data.userId, boardMembershipRole:data.role, boardMembershipCanComment:data.canComment?'true':'false',  boardId:boardId, userId:cookies.UserId};

        const response = await apiModifyBoard(board);
        if(response && boardId){
            if(response.outBoardMembershipId){  // 성공하면 
                const newuser:IBoardUser = {
                    boardMembershipId:response.outBoardMembershipId,
                    boardId:boardId,
                    userId:data.userId,
                    userName:data.userName,
                    role: data.role, 
                    avatarUrl: data.avatarUrl,
                    userEmail: data.userEmail,
                    canEdit: data.canEdit,
                    canComment: data.canComment
                }
            //recoil 추가 
            const updatedUsers = currentBoard.users.concat(newuser);
            setUser(updatedUsers);
            setUsersPool([newuser]);
            //boardUsers = boardUsers.concat(user);

            // state  추가 
            setIsMemberLoading(!isMemberLoading);
            //setBoardMemberAction(false);
            }else if(response.message){
            //    setDeleteStep(true);  // 에러 메세지를 표현 해 주어야 하나??
            }else{
            //    setDeleteStep(true);
            }
        }        
    }
    const handleUserDelete = useCallback(async (userId:string, delboardId:string) => {
        setDeleteStep(false); 
        
    },[]);
        
    const onUpdate = useCallback( async(boardId:string, userId:string, data:any)=>{
        // server 처리 할 것 .
        const board : IModifyBoard= {...defaultModifyBoard,
                    boardMembershipActionType:'UPDATE', 
                    boardMembershipUserId:userId, 
                    boardMembershipRole:data.role, 
                    boardMembershipCanComment:data.canComment?'true':'false',
                    boardId:boardId, 
                    userId:cookies.UserId};

        const response = await apiModifyBoard(board);
         if(response){
            const changeBoardUser = boardUser.filter((user)=>user.userId === userId)[0];
            const changedBoardUser = {...changeBoardUser,canComment:data.canComment, role:data.role, canEdit:data.role==='viewer' ? false:true };

            const updatedUsers = boardUser.map((user:any) => {
                if(user.boardMembershipId === changedBoardUser.boardMembershipId) {
                    return{...user, ...changedBoardUser};
                 }
                return user;
            })
            setUser(updatedUsers);
        }
    },[boardUser, cookies.UserId, setUser]);

    const handleClick = useCallback(()=>{
    }, [])

    const onBack = () =>{
        setDeleteStep(false);
     //   setBoardMemberAction(false);
    };     

    const onProjectUpdate = useCallback( async(boardId:any, userId:any, data:any)=>{
        // proeject manager 관리 db 처리 실행, 
        const addProjectMember:IModifyProject = {...defaultModifyProject, 
            creatorUserId:cookies.UserId, projectActionType:'ADD MANAGER', 
            managerId:userId, role:data.role, projectId:projectId};
            try{
                const response:any = await apiPostProjects(addProjectMember);
    
                if(response){
                    if(!response.message){
                    // state  추가 
                    setIsMemberLoading(!isMemberLoading);
                    // 현재 project atom 추가 변경 
                    const newuser:IBoardUser = {
                        boardMembershipId:"",
                        boardId:"",
                        userId:userId,
                        userName:data.userName,
                        role: data.role, 
                        avatarUrl: data.avatarUrl,
                        userEmail: data.userEmail,
                        canEdit: true,
                        canComment: data.canComment
                    }
                        //recoil 추가 
                        proejctUsersUpdate([newuser]);
                        //projectSetUsers([newuser]);
                        //projectSetUsersPool([newuser]);
    
                    }else{
                        console.log("response", response.message);
                    }
                }
                
              }catch(err){
                console.error(err);
              }            
    }
    ,[]
    );

    const handleProjectUserDelete = useCallback( async(userId:any, delProjectId:any) => {

    }
    ,[]);

    const handleProjectUserCreate = useCallback( async(data:IBoardUser) => {
        // proeject manager 관리 db 처리 실행, 
        const addProjectMember:IModifyProject = {...defaultModifyProject, 
        creatorUserId:cookies.UserId, projectActionType:'ADD MANAGER', 
        managerId:data.userId, role:data.role, projectId:projectId};
        try{
            const response:any = await apiPostProjects(addProjectMember);

            if(response){
                if(!response.message){
                // state  추가 
                setIsMemberLoading(!isMemberLoading);
                // 현재 project atom 추가 변경 
                const newuser:IBoardUser = {
                    boardMembershipId:"",
                    boardId:"",
                    userId:data.userId,
                    userName:data.userName,
                    role: data.role, 
                    avatarUrl: data.avatarUrl,
                    userEmail: data.userEmail,
                    canEdit: true,
                    canComment: data.canComment
                }
                    //recoil 추가 
                    projectSetUsers([newuser]);
                    projectSetUsersPool([newuser]);

                }else{
                    console.log("response", response.message);
                }
            }
            
          }catch(err){
            console.error(err);
          }
    }
    ,[]);
   
   
    if (boardId && boardUser.length > 0) {
        return(
            <span className={styles.users}>
                {/* 보드에 접근 가능한 사용자 */}``
                { boardUser.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                     <ActionsPopup
                        boardId={boardId}
                        projectId={""}
                        membership={user}
                        permissionsSelectStep={permissionsSelectStep}
                        leaveButtonContent={t('action.leaveBoard')}
                        leaveConfirmationTitle={t('common.leaveBoard')}
                        leaveConfirmationContent={t('common.areYouSureYouWantToLeaveBoard')}
                        leaveConfirmationButtonContent={t('action.leaveBoard')}
                        deleteButtonContent={t('action.removeFromBoard')}
                        deleteConfirmationTitle={t('common.removeMember')}
                        deleteConfirmationContent={t('common.areYouSureYouWantToRemoveThisMemberFromBoard')}
                        deleteConfirmationButtonContent={t('action.removeMember')}
                        canEdit={canEdit}
                        canLeave={boardUser.length > 1 ? true:false}
                        onUpdate={(boardId:any, userId:any, data:any) => onUpdate(boardId, userId, data)}
                        onDelete={(userId:any, delBoardId:any) => handleUserDelete(userId, delBoardId)}
                     >   
                        <User
                            name={user.userName}
                            avatarUrl={user.avatarUrl}
                            size="large"
                            isDisabled={false}
                            onClick={handleClick}
                        />
                    </ActionsPopup>    
                    </span> 
                ))}
                { /* deleteStep&&
                <DeleteStep boardId={boardId} 
                            userId={boardMemberActionUserId.userId} 
                            title={t('common.leaveBoardTitle')} 
                            content={t('common.leaveBoardContent')} 
                            buttonContent={t('action.leaveBoardButton')} 
                            onConfirm={handleUserDelete}  
                onBack={onBack} />  */}
              {/*      <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}> 
                        <DeleteStep boardId={boardId} userId={boardMemberActionUserId.userId} title={t('common.leaveBoardTitle')} content={t('common.leaveBoardContent')} buttonContent={t('action.leaveBoardButton')} onConfirm={handleUserDelete}  onBack={onBack} />
                </div>  */} 
                    
                 {canEdit&&
                    <AddPopup
                    users={usersPool}
                    currentUserIds={cookies.UserId}
                    permissionsSelectStep={permissionsSelectStep}
                    title={t('common.addBoardMember')}
                    onCreate={onCreate}
                >
                    <Button icon="add user" className={styles.addUser} />
                </AddPopup>
                }
            </span>    
        );
    }
    else if (projectId && projectUsers && projectUsers.length > 0) {
        return(
            <span className={styles.users}>
                { projectUsers.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                     <ActionsPopup
                        boardId={""}
                        projectId={projectId}
                        membership={user}
                        permissionsSelectStep={projectPermissionsSelectStep}
                        leaveButtonContent={t('action.leaveProject')}
                        leaveConfirmationTitle={t('common.leaveProject')}
                        leaveConfirmationContent={t('common.areYouSureYouWantToLeaveProject')}
                        leaveConfirmationButtonContent={t('action.leaveProject')}
                        deleteButtonContent={t('action.removeFromProject')}
                        deleteConfirmationTitle={t('common.removeMember')}
                        deleteConfirmationContent={t('common.areYouSureYouWantToRemoveThisManagerFromProject')}
                        deleteConfirmationButtonContent={t('action.removeFromProject')}
                        canEdit={canEdit}
                        canLeave={projectUsers.length > 1 ? true:false}
                        onUpdate={(projectId:any, userId:any, data:any) => onProjectUpdate(boardId, userId, data)}
                        onDelete={(userId:any, delProjectId:any) => handleProjectUserDelete(userId, delProjectId)}
                     >   
                        <User
                            name={user.userName}
                            avatarUrl={user.avatarUrl}
                            size="large"
                            isDisabled={false}
                            onClick={handleClick}
                        />
                    </ActionsPopup>    
                       
                    </span> 
                ))}
                { /* deleteStep&&
                <DeleteStep boardId={boardId} 
                            userId={boardMemberActionUserId.userId} 
                            title={t('common.leaveBoardTitle')} 
                            content={t('common.leaveBoardContent')} 
                            buttonContent={t('action.leaveBoardButton')} 
                            onConfirm={handleUserDelete}  
                onBack={onBack} />  */}
              {/*      <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}> 
                        <DeleteStep boardId={boardId} userId={boardMemberActionUserId.userId} title={t('common.leaveBoardTitle')} content={t('common.leaveBoardContent')} buttonContent={t('action.leaveBoardButton')} onConfirm={handleUserDelete}  onBack={onBack} />
                </div>  */} 
                    
                 {canEdit&&
                    <AddPopup
                    users={projectUsersPool}
                    currentUserIds={cookies.UserId}
                    permissionsSelectStep={projectPermissionsSelectStep}
                    title={t('common.addMember')}
                    onCreate={handleProjectUserCreate}
                >
                    <Button icon="add user" className={styles.addUser} />   
                </AddPopup>
                }
            </span>    
        );        
    }
    return null; // or some other fallback UI
}
export default Membership;