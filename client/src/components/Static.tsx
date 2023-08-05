import Projects from "./Projects";
import Boards from "./Boards";
import Board from "./Board";
import BoardAction from "./BoardAction";
import styles from "../scss/Static.module.scss";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
    boardId:string;
}
function Static({projectId, boardId}:IStaticProps){

    const queryProjectById = projectId ==="" ?  false:true;
    const queryBoardById = boardId ==="" ?  false:true;

    // projectId가 넘어오면 projectId만 넘기고  => atom에 currentProjetId를 셋한다.(Core에서 이미 한듯.)
    // boardId가 넘어오면 projectId와 boardId를 같이 넘긴다. 
    return(
        <div className={`${styles.wrapper}`}>
            {!queryProjectById && <Projects />}
            {queryProjectById &&<Boards projectId={projectId}/> }
            {queryBoardById &&<BoardAction boardId={boardId}/> }
            {queryBoardById &&<Board boardId={boardId}/> }
         </div>
    )
}
export default Static;