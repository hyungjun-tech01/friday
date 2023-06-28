import styled from "styled-components";
import styles from "./NotiModal.module.scss";

// notimodal props interface 정의 
interface INotiModalProps{
    setShowNoti: (value:boolean) => void;
}


function NotiModal({setShowNoti}:INotiModalProps) {
    return (
        <div className={`${styles.overlay} ${styles.modal}`}>
            <div className={styles.title}>
                <div> Notification</div>
                <button className={styles.button} onClick={()=>setShowNoti(false)}>X</button>
            </div>
            <div className={styles.content}> 
                <label> 일정이 없습니다. </label>
                <label> 일정이 없습니다. </label>
                <label> 일정이 없습니다. </label>
            </div>
        </div>
    );
}

export default NotiModal;