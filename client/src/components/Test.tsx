import {useParams} from "react-router-dom";
import React from "react";
interface ITest{
    id : string;
}
function Test(){
    const {id} = useParams<ITest>();
    return(
        <div>
            Board : ProjectId = {id};
        </div>
    )
}
export default Test;