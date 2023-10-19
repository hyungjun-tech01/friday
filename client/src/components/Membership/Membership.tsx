import {IBoardUser, IModifyBoard, defaultModifyBoard} from "../../atoms/atomsBoard";
import styles from "./Membership.module.scss";
import BoardMemberActionPopup from "../BoardMemberActionPopup";
import BoardMemberPermission from "../BoardMemberPermission";
import {Button} from "semantic-ui-react";
import User from "../User";
import BoardMemeberAdd from "../BoardMemeberAdd";
import {useCallback, useState} from "react";
import {useCookies} from "react-cookie";
import DeleteStep from "../DeleteStep";
import {useTranslation} from "react-i18next";
import {apiModifyBoard} from "../../api/board";
import { Value } from "sass";
import { previousDay } from "date-fns";
import { getRoles } from "@testing-library/react";
import  usePopup  from '../../lib/hook/use-popup';
import AddStep from "./AddStep";
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
    const [positions, setPositions] = useState({positionX:-1, positionY:-1})

    const onAddMemberPopup = (event:React.MouseEvent<HTMLButtonElement>)=>{
        console.log('onAddMemberPopup');
        setPositions({positionX:event.pageX,  positionY:event.pageY});
        setOnAddPopup(true);
    }
    const AddPopup = usePopup(AddStep);
    const [onAddPopup, setOnAddPopup] = useState(false);
    // userId 와 현재 클릭한 포지션 획득 
    const [boardMemberActionUserId, setBoardMemberActionUserId] = useState<IboardMemberActionUserId>({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });
    // board member 권한 및 삭제 
    const [boardMemberAction, setBoardMemberAction] = useState(false);
    // 사용자 삭제 Modal 
    const [deleteStep, setDeleteStep]  = useState(false);
    const [boardMemeberPermissionUserId, setBoardMemeberPermissionUserId]  = useState<IboardMemberActionUserId>({userId:"", userName:"", avatarUrl:"", userEmail:"", canEdit:canEdit,role:"", positionX:-1, positionY:-1 });
    const handleDeleteClick = () => { 
        // 보드에서 멤버를 제거하는 Modal 띄움 DeleteStep
        console.log('handleDeleteClick');
        setDeleteStep(true);
        setBoardMemberAction(true);
      }
    const onCreate = ()=>{
        console.log('membership boardmember create');
    }
    const onConfirm = async ()=>{
        // server 처리 
        const board : IModifyBoard= {...defaultModifyBoard, boardMembershipActionType:'DELETE', boardMembershipUserId:boardMemberActionUserId.userId, boardId:boardId, userId:cookies.UserId};
    
        const response = await apiModifyBoard(board);
        console.log('response', response, response.status);
        if(response){
            if(response.boardId){  // 성공하면 
                setDeleteStep(false); // 
                setBoardMemberAction(true);
                setIsMemberLoading(!isMemberLoading);
            }else if(response.message){
                setDeleteStep(true);  // 에러 메세지를 표현 해 주어야 하나??
            }else{
                setDeleteStep(true);
            }
        }
    };
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
    if (members) {
        return(
            <span className={styles.users}>
                {/* 보드에 접근 가능한 사용자 */}``
                {members.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                        <User userId={user.userId} onClick={handleClick} size="small"
                            showAnotherPopup={setBoardMemberActionUserId} 
                            userName={user.userName} 
                            userEmail={user.userEmail}
                            avatarUrl={user.avatarUrl}
                            canEdit = {user.canEdit}/>
                        {user.userName}
                    </span> 
                ))}
                {/*사용자 확인 및 권한 변경 및 보드에서 사용자 삭제 기능 */}
                { !boardMemberAction&&boardMemberActionUserId.userId !== "" && (
                    <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}>
                        <BoardMemberActionPopup boardId={boardId} currentUserCanEdit={members[0].canEdit} currentUserId={cookies.UserId} userName={boardMemberActionUserId.userName} userEmail={boardMemberActionUserId.userEmail} canEdit= {boardMemberActionUserId.canEdit} avatarUrl = {boardMemberActionUserId.avatarUrl} showPopUp = {setBoardMemberActionUserId} 
                           userId={boardMemberActionUserId.userId} handleDeleteClick={handleDeleteClick} /> 
                    </div> )
                }
                { deleteStep&&
                    <div style = {{top:`${boardMemberActionUserId.positionY}px`, left:`${boardMemberActionUserId.positionX}px` , position:'absolute'}}>
                        <DeleteStep title={t('common.leaveBoardTitle')} content={t('common.leaveBoardContent')} buttonContent={t('action.leaveBoardButton')} onConfirm={onConfirm}  onBack={onBack} />
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
                    users={allUsers}
                    currentUserIds={cookies.UserId}
                    permissionsSelectStep={permissionsSelectStep}
                    title={t('common.addBoardMember')}
                    onCreate={onCreate}
                >
                    <Button icon="add user" className={styles.addUser} />
                </AddPopup>
                }
                {boardMemeberPermissionUserId.userId !== "" &&
                  <div style = {{top:`${positions.positionY}px`, left:`${positions.positionX}px` , position:'absolute'}}>
                  <BoardMemberPermission addBoardId={boardId} addMember={boardMemeberPermissionUserId}
                 title={t('common.selectPermission')} content={t('common.leaveBoardContent')} buttonContent={t('action.addMember')}  
                 setBoardMemeberPermissionUserId={setBoardMemeberPermissionUserId}
                 onMemberConfirm={onMemberConfirm}  onBack={onMemberBack}  />
                </div>
                }  
            </span>    
        );
    }
    return null; // or some other fallback UI
}
export default Membership;