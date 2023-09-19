import Projects from "./Projects";
import Boards from "./Boards";
import Board from "./Board";
import BoardAction from "./BoardAction";
import BoardFirstAdd from "./BoardFirstAdd";
import styles from "../scss/Static.module.scss";
import {  useRecoilState} from "recoil";
import {atomCurrentMyBoard} from "../atoms/atomsBoard";
import {apiGetCurrentBoards} from "../api/board";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
    boardId:string;
    defaultBoardId : string;
}
function Static({projectId, boardId, defaultBoardId}:IStaticProps){
    const [currentBoardId, setCurrentBoardId] = useRecoilState(atomCurrentMyBoard);
    const getCurrentBoard = async (id:string) => {
        const response = await apiGetCurrentBoards(id);
        if(response ) {
          setCurrentBoardId({...currentBoardId, boardId:id, users:response.users, labels:response.labels});
        }
      };

      
    if(defaultBoardId === null ){  //project 를 선택했는데 보드가 해당 프로젝트에 보드가 없을 때 
        return (
            <div className={`${styles.wrapper}`}>
                <Boards projectId={projectId}/> 
                <BoardFirstAdd />
            </div>
        );
    }else{
       // setCurrentBoardId({boardId:defaultBoardId});
       if(defaultBoardId !== "" && boardId ==="" ){
        getCurrentBoard(defaultBoardId);
       }
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