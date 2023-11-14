import Projects from "./Projects";
import Boards from "./Boards/Boards";
import Board from "./Board";
import BoardAction from "./BoardAction";
import BoardFirstAdd from "./BoardFirstAdd";
import styles from "../scss/Static.module.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import { atomCurrentMyBoard } from "../atoms/atomsBoard";
import { apiGetCurrentBoards} from "../api/board";
import { useCookies } from "react-cookie";
import { IList } from "../atoms/atomsList";
import { atomProjectsToLists , projectSelector} from "../atoms/atomsProject";
import React from "react";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
    boardId:string;
    defaultBoardId : string;
}
function Static({projectId, boardId, defaultBoardId}:IStaticProps){
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [currentBoard, setCurrentBoard] = useRecoilState(atomCurrentMyBoard);
    const [projectsToLists, setProjectsToLists] = useRecoilState(atomProjectsToLists);

    const currentProject = useRecoilValue(projectSelector);
    const currentProject1 = currentProject(projectId)[0];

    if(currentProject1) {
    const cadEditBoard = currentProject1.isAdmin || currentProject1.role === 'manager' ? true : false;
    console.log('static currentProject', currentProject1, cadEditBoard);
    }

    const getCurrentBoard = async (id:string) => {
        const response = await apiGetCurrentBoards({boardId:id, userId:cookies.UserId});
        if(response ) {
            setCurrentBoard({...currentBoard, ...response});
            // --------------------------------------------------
            for(let i=0; i < projectsToLists.length; i++) {
                for(let j=0; j <projectsToLists[i].boards.length; j++) {
                    if(projectsToLists[i].boards[j].id === id) {
                        const updateLists = response.lists.map((list:IList) => ({id: list.listId, name: list.listName}));
                        const updateBoardToLists = {
                            ...projectsToLists[i].boards[j],
                            lists: updateLists,
                            isFetching: false,
                        };
                        const updateProjectToBoards = {
                            ...projectsToLists[i],
                            boards: [
                                ...projectsToLists[i].boards.slice(0, j),
                                updateBoardToLists,
                                ...projectsToLists[i].boards.slice(j + 1),
                            ],
                        };
                        const updateProjectsToLists = [
                            ...projectsToLists.slice(0, i),
                            updateProjectToBoards,
                            ...projectsToLists.slice(i + 1),
                        ];
                        setProjectsToLists(updateProjectsToLists);
                    }
                }
            };
        }
      };

      
    if(defaultBoardId === null ){  //project 를 선택했는데 보드가 해당 프로젝트에 보드가 없을 때 
        return (
            <div className={`${styles.wrapper}`}>
                <Boards projectId={projectId}/> 
                <BoardFirstAdd />
            </div>
        );
    } else {
       // setCurrentBoardId({boardId:defaultBoardId});
       if(defaultBoardId !== "" && boardId ==="") {
        getCurrentBoard(defaultBoardId);
       }
        return(
            <div className={`${styles.wrapper}`}>
                {projectId ==="" ?  <Projects /> : <Boards projectId={projectId}/> } 
                {defaultBoardId === "" ?  "" : (
                boardId === "" ?  <BoardAction boardId={defaultBoardId}/> : <BoardAction boardId={boardId}/> 
                )}    
                {defaultBoardId === "" ? "" : (
                    boardId === "" ? <Board boardId={defaultBoardId}/> : <Board boardId={boardId}/> 
                )}

            </div>
        );
    }
}
export default Static;