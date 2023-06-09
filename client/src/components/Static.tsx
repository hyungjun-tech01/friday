import {useRecoilValue} from "recoil";
import {IProject, getCurrentProject, atomCurrentProject} from "../atoms/atomsProject"

import Projects from "./Projects";
import Board from "./Board";
import List from "./List";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
    boardId:string;
}
function Static({projectId, boardId}:IStaticProps){

    const currentProject = useRecoilValue<IProject[]>(atomCurrentProject);

    const queryProjectById = projectId ==="" ?  false:true;
    const queryBoardById = boardId ==="" ?  false:true;
    console.log("static project Name", currentProject[0].projectId);


    // projectId가 넘어오면 projectId만 넘기고  => atom에 currentProjetId를 셋한다.(Core에서 이미 한듯.)
    // boardId가 넘어오면 projectId와 boardId를 같이 넘긴다. 
    return(
        <div >
            
            {!queryProjectById && <Projects />}
            {queryProjectById &&<Board projectId={projectId}/> }
            {queryBoardById &&<List boardId={boardId}/> }
        </div>
    )
}
export default Static;