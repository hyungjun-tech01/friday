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
    if(defaultBoardId === null ){
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
                {/* 보드가 아예 없다면(defaultBoardId == "" ) ,  <BoardFirstAdd/> 
                    선택한 보드가 있다면 BoardAction + Board 
                    선택한 보드가 없는데 디폴트보드가 있다면 BoardAction + Board <- defaultBoiardId */}
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