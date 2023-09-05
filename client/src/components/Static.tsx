import Projects from "./Projects";
import Boards from "./Boards";
import Board from "./Board";
import BoardAction from "./BoardAction";
import BoardFirstAdd from "./BoardFirstAdd";
import styles from "../scss/Static.module.scss";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
    boardId:string;
    defaultBoardId : string;
}
function Static({projectId, boardId, defaultBoardId}:IStaticProps){
    console.log("defaultBoardId", defaultBoardId);
    if(defaultBoardId === null ){  //project 를 선택했는데 보드가 해당 프로젝트에 보드가 없을 때 
        return (
            <div className={`${styles.wrapper}`}>
                <Boards projectId={projectId}/> 
                <BoardFirstAdd />
            </div>
        );
    }else{
        return(
            <div className={`${styles.wrapper}`}>
                {projectId ==="" ?  <Projects /> : <Boards projectId={projectId}/> } 
                {defaultBoardId === "" ?  "": (
                boardId === "" ?  <BoardAction boardId={defaultBoardId}/>  : <BoardAction boardId={boardId}/> 
                )}    
                {defaultBoardId === "" ? "" : (
                    boardId ==="" ? <Board boardId={defaultBoardId}/>: <Board boardId={boardId}/> 
                )}

            </div>
        );
    }
}
export default Static;