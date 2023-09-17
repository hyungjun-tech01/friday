import styles from '../scss//BoardMemberAdd.module.scss';

interface IBoardMemberPermission{
    addBoardId : string;
    addMemberId : string;
}
function BoardMemberPermission({addBoardId, addMemberId}:IBoardMemberPermission){
    return(
        <div className = {styles.overlay}>
            <div className={styles.modal} >
                BoardMemberPermission{addBoardId},{addMemberId}
            </div>
        </div>
    );
}
export default BoardMemberPermission;