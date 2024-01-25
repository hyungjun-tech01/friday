import React from "react";
import Header from "./Header";
import styles from "../scss/Fixed.module.scss";
function Fix({setCurrent, projectName, projectId}:any){
    return(
        <div className={styles.wrapper}>
            <Header setCurrent={setCurrent} projectName={projectName} projectId={projectId}/>
        </div>
    )
}

export default Fix;