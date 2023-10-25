import {useTranslation} from "react-i18next";
import {useCookies} from "react-cookie";
import {Button} from "semantic-ui-react";
import {useSetRecoilState, useRecoilValue} from "recoil";
import {useEffect} from "react";


import {IBoardUser, usersPoolSelector, 
       IModifyBoard, defaultModifyBoard, 
       usersSelector, atomCurrentMyBoard, 
       } from "../../atoms/atomsBoard";
import styles from "./Membership.module.scss";
import BoardMemberActionPopup from "../BoardMemberActionPopup";
import BoardMemberPermission from "../BoardMemberPermission";
import User from "../User";
import {useCallback, useState} from "react";
import DeleteStep from "../DeleteStep";
import {apiModifyBoard} from "../../api/board";
import  usePopup  from '../../lib/hook/use-popup';
import AddStep from "./AddStep";
import ActionsStep from "./ActionsStep";


import permissionsSelectStep from "../BoardMembershipPermissionsSelectStep";

interface IMembershipProps {
    boardId: string;
    canEdit : boolean;
    members?: IBoardUser[];
    allUsers?:IBoardUser[];
    isMemberLoading : boolean;
    setIsMemberLoading: (value:boolean) => void;
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
function Membership({boardId, canEdit, members, allUsers, isMemberLoading, setIsMemberLoading}:IMembershipProps){
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [positions, setPositions] = useState({positionX:-1, positionY:-1});

    const onAddMemberPopup = (event:React.MouseEvent<HTMLButtonElement>)=>{
        console.log('onAddMemberPopup');
        setPositions({positionX:event.pageX,  positionY:event.pageY});
        setOnAddPopup(true);
    }
    const AddPopup = usePopup(AddStep);
    const ActionsPopup = usePopup(ActionsStep);

    const [onAddPopup, setOnAddPopup] = useState(false);
    // userId 와 현재 클릭한 포지션 획득 
    const [boardMemberActionUserId, setBoardMemberActionUserId] = useState<IboardMemberActionUserId>({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });
    // board member 권한 및 삭제 
    const [boardMemberAction, setBoardMemberAction] = useState(false);
    // 사용자 삭제 Modal 
    const [deleteStep, setDeleteStep]  = useState(false);
    const [boardMemeberPermissionUserId, setBoardMemeberPermissionUserId]  = useState<IboardMemberActionUserId>({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });

    const currentBoard = useRecoilValue(atomCurrentMyBoard);
    const boardUser = useRecoilValue(usersSelector);
    const setUser = useSetRecoilState(usersSelector);

    const usersPool =  useRecoilValue(usersPoolSelector);
    const setUsersPool = useSetRecoilState(usersPoolSelector);

  //  const deleteboarduser = useRecoilValue(userDeletor(boardMemberActionUserId.userId));
  //  const deleteUser = useSetRecoilState(userDeletor(boardMemberActionUserId.userId));
    
    const handleDeleteClick = () => { 
        // 보드에서 멤버를 제거하는 Modal 띄움 DeleteStep
        console.log('handleDeleteClick', boardMemberActionUserId.userId);
        setDeleteStep(true);
        setBoardMemberAction(true);
      }
    const onCreate = async (data:IBoardUser)=>{
        setBoardMemberAction(true);

        // server 처리 할 것 .
        const board : IModifyBoard= {...defaultModifyBoard, boardMembershipActionType:'ADD', boardMembershipUserId:data.userId, boardMembershipRole:data.role, boardMembershipCanComment:data.canComment?'true':'false',  boardId:boardId, userId:cookies.UserId};

        const response = await apiModifyBoard(board);
        if(response){
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
            setBoardMemberAction(false);
            }else if(response.message){
            //    setDeleteStep(true);  // 에러 메세지를 표현 해 주어야 하나??
            }else{
            //    setDeleteStep(true);
            }
        }        
    }
    const handleUserDelete = useCallback(async (userId:string, delboardId:string) => {
        console.log('delete user : ', userId);
        setDeleteStep(false); 
        // server 처리 
        const boardAA : IModifyBoard= {...defaultModifyBoard, boardMembershipActionType:'DELETE', 
            boardMembershipUserId:userId, 
            boardId:delboardId, userId:cookies.UserId};
    
        console.log('deleteUser', boardAA);
        const response = await apiModifyBoard(boardAA);
        if(response){
            if(response.boardId){ 
              const updatedCurrentUsers = boardUser.filter(user => user.userId !== userId);
              const delUser = boardUser.filter(user => user.userId === userId)[0];
              console.log('updatedCurrentUsers', boardUser, updatedCurrentUsers, userId);
              setUser(updatedCurrentUsers);

              const newuser:IBoardUser = {...delUser, 
                role:null,
                canEdit:null,
            }
            console.log('delUser', newuser);
              setUsersPool([newuser]);
              setIsMemberLoading(false);
              setBoardMemberAction(false);
              setBoardMemberActionUserId({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });
            }else if(response.message){
                console.log('Fail to     delete card', response.message);
                //    setDeleteStep(true);  // 에러 response 표현 해 주어야 하나??
            }else{
                //    setDeleteStep(true);
            }
        }
    },[]);
        
    const onDelete = useCallback( async(userId:string)=>{

    },[]);

    const onUpdate = useCallback( async(userId:string, data:any)=>{

    },[]);

    const handleClick = useCallback(()=>{
        console.log("Temporary function");
    }, [])

    const onBack = () =>{
        setDeleteStep(false);
        setBoardMemberAction(false);
    };     
    const onMemberBack = () => {
        setOnAddPopup(true);
        setBoardMemeberPermissionUserId({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit, role:"", positionX:-1, positionY:-1 });
    } 
    const onMemberConfirm = () => {
        //db 처리 
        //add recoil
        setBoardMemeberPermissionUserId({...boardMemeberPermissionUserId})
    }
    if (boardUser.length > 0) {
        return(
            <span className={styles.users}>
                {/* 보드에 접근 가능한 사용자 */}``
                { boardUser.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                     <ActionsPopup
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
                        onUpdate={(data:any) => onUpdate(user.userId, data)}
                        onDelete={() => onDelete(user.userId)}
                     >   
                        <User userId={user.userId} onClick={handleClick} size="small"
                            showAnotherPopup={setBoardMemberActionUserId} 
                            userName={user.userName} 
                            userEmail={user.userEmail}
                            avatarUrl={user.avatarUrl}
                            canEdit = {currentBoard.canEdit}/>
                    </ActionsPopup>    
                        {user.userName}
                    </span> 
                ))}
                {/*사용자 확인 및 권한 변경 및 보드에서 사용자 삭제 기능 */}
                { !boardMemberAction&&boardMemberActionUserId.userId !== "" && (
                    <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}>
                        <BoardMemberActionPopup boardId={boardId} currentUserCanEdit={currentBoard.canEdit} currentUserId={cookies.UserId} userName={boardMemberActionUserId.userName} userEmail={boardMemberActionUserId.userEmail} canEdit= {boardMemberActionUserId.canEdit} avatarUrl = {boardMemberActionUserId.avatarUrl} showPopUp = {setBoardMemberActionUserId} 
                           userId={boardMemberActionUserId.userId} handleDeleteClick={handleDeleteClick} /> 
                    </div> )
                }
                { deleteStep&&
                    <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}>
                        <DeleteStep boardId={boardId} userId={boardMemberActionUserId.userId} title={t('common.leaveBoardTitle')} content={t('common.leaveBoardContent')} buttonContent={t('action.leaveBoardButton')} onConfirm={handleUserDelete}  onBack={onBack} />
                    </div>
                }            
                {/* Add Borad Member 기능  */}
                {/* canEdit  && 
                <Button icon="add user" onClick={onAddMemberPopup} style={{backgroundColor:'rgba(0, 0, 0, 0.24)',
                    borderRadius: '50%',
                    boxShadow: 'none',
                    color: '#fff',
                    lineHeight: '36px',
                    margin: '0',
                    padding: '0',
                    transition: 'all 0.1s ease 0s',
                    alignItems: 'center',
                    verticalAlign: 'top',
    width: '36px',}} /> */}
                {/*members !== undefined &&onAddPopup&&
                  <div style = {{top:`${positions.positionY}px`, left:`${positions.positionX}px` , position:'absolute'}}>
                    <BoardMemeberAdd members={members} canEdit={canEdit} setOnAddPopup={setOnAddPopup} setBoardMemeberPermissionUserId={setBoardMemeberPermissionUserId}/>
                </div> */}
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
                {/*boardMemeberPermissionUserId.userId !== "" &&
                  <div style = {{top:`${positions.positionY}px`, left:`${positions.positionX}px` , position:'absolute'}}>
                  <BoardMemberPermission addBoardId={boardId} addMember={boardMemeberPermissionUserId}
                 title={t('common.selectPermission')} content={t('common.leaveBoardContent')} buttonContent={t('action.addMember')}  
                 setBoardMemeberPermissionUserId={setBoardMemeberPermissionUserId}
                 onMemberConfirm={onMemberConfirm}  onBack={onMemberBack}  />
                </div>
            */}  
            </span>    
        );
    }
    return null; // or some other fallback UI
}
export default Membership;