import {IBoardMember} from "../atoms/atomsBoard";
import styles from "../scss/Membership.module.scss";
import BoardMemberActionPopup from "./BoardMemberActionPopup";
import User from "./User";

interface MembershipProps {
    members?: IBoardMember[];
  }
  
function Membership({members}:MembershipProps){
    if (members) {
        console.log('members', members[0].boardId);
        return(
            <span className={styles.users}>
                {members[0].users.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                        <BoardMemberActionPopup userId={user.userId} /> 
                        <User userName={user.userName} avatarUrl={user.avatarUrl}/>
                    </span> 
                ))}
            </span>
        );
    }
    return null; // or some other fallback UI
}
export default Membership;