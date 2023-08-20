import Membership from "./Membership";
import {useCookies} from "react-cookie";
import {apiCheckEditBoard} from "../api/board";
import {ICheckBoardEditAuth, IBoardMember} from "../atoms/atomsBoard";
import {useState,useEffect} from "react";
import styles from "../scss/BoardAction.module.scss";
//import Filters from "./Filters";
interface IBoardActionProp{
    boardId:string;
}
function BoardAction({boardId}:IBoardActionProp){
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    // 이 보드에 현재 User가 Edit 권한이 있는지 확인하여 Membership 에 전달.
    const [members,SetMembers] = useState<IBoardMember[]>();
    const [isMemberLoading, setIsMemberLoading] = useState(true);
    const checkEdit = async () => {
        const checkAuth:ICheckBoardEditAuth= {"boardId":boardId, "userId":cookies.UserId };
        const response = await apiCheckEditBoard(checkAuth);
        if(response.messsage){
            setIsMemberLoading(true);
        }else{
            SetMembers(response);
            console.log('members query',response, members);
            setIsMemberLoading(false);
        }

    }
    useEffect(()=>{checkEdit()},[boardId]);
    return(
        <div className={styles.wrapper}>
            <div className={styles.actions}>
                <div className={styles.action}>
                    {members !== undefined &&<Membership members={members} boardId={boardId}/>}
            {/*<Filters />*/}
                </div>
            </div>
        </div>
    );
}
export default BoardAction;