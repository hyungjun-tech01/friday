import {IBoardMember} from "../atoms/atomsBoard";
import styles from "../scss/Membership.module.scss";
import BoardMemberActionPopup from "./BoardMemberActionPopup";
import {Button} from "semantic-ui-react";
import User from "./User";
import BoardMemeberAdd from "./BoardMemeberAdd";
import {useState} from "react";

interface MembershipProps {
    members?: IBoardMember[];
  }
  
function Membership({members}:MembershipProps){
    const onAddMemberPopup = ()=>{
        console.log('onAddMemberPopup');
        setOnAddPopup(true);
    }
    const [onAddPopup, setOnAddPopup] = useState(false);
    if (members) {
        console.log('members', members[0].canEdit);
        return(
            <span className={styles.users}>
                {members[0].users.map((user)=>(
                    <span key={user.userId} className={styles.user}>
                        <BoardMemberActionPopup userId={user.userId} /> 
                        <User userName={user.userName} avatarUrl={user.avatarUrl}/>
                    </span> 
                ))}

            {members[0].canEdit==="editor" && 
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
                width: '36px',}} />}
            {onAddPopup&&<BoardMemeberAdd setOnAddPopup={setOnAddPopup}/>}
            </span>    
        );
    }
    return null; // or some other fallback UI
}
export default Membership;