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
    const queryProjectById = projectId ==="" ?  false:true;
    const queryBoardById = boardId ==="" ?  false:true;
    console.log(queryProjectById&&"projectId", projectId, queryBoardById&&"boardId",boardId);
    return(
        <div >
            {!queryProjectById && !queryBoardById && <Projects />}
            {queryProjectById &&<Board projectId={projectId}/> }
            {queryBoardById &&<List boardId={boardId}/> }
        </div>
    )
}
export default Static;