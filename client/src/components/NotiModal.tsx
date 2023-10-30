import styles from "../scss/NotiModal.module.scss";
import React from "react";
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
                <label className={styles.label}> 일정이 없습니다. </label>
                <label className={styles.label}> 일정이 없습니다. </label>
                <label className={styles.label}> 일정이 없습니다. </label>
            </div>
        </div>
    );
}

export default NotiModal;