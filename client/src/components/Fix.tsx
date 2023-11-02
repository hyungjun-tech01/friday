import React from "react";
import Header from "./Header";
function Fix({setCurrent, projectName, projectId}:any){
    return(
        <div>
            <Header setCurrent={setCurrent} projectName={projectName} projectId={projectId}/>
        </div>
    )
}

export default Fix;