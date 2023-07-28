import {useRecoilState} from "recoil";
import {IBoard, atomMyBoard} from "../atoms/atomsBoard";
import {useQuery} from "react-query";
import { Button, Icon } from 'semantic-ui-react';
import {Link} from "react-router-dom";
import {useState} from "react";

import {apiGetBoards} from "../api/board";
import styles from "../scss/Board.module.scss";
import Paths from "../constants/Paths";
import AddBoardModal from "./AddBoardModal";

interface IBoardProps{
    projectId:string;
}

function Board({projectId}:IBoardProps){
    //project id로 보드를 쿼리할 것.
    const [boards, setBoards] = useRecoilState<IBoard[]>(atomMyBoard); 
    // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 
    const userId = "967860418955445249";
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const {isLoading, data, isSuccess} = useQuery<IBoard[]>(["allMyBoards", projectId], ()=>apiGetBoards(projectId),{
        onSuccess: data => {
            setBoards(data);   // use Query 에서 atom에 set 
            console.log(boards);
        },
       // enabled : !showProjectAddModal
      }
    );    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const onCreate = ()=> {
        console.log("create board");
        setShowCreateModal(true);
    };
    return(
        <>
            <div className={styles.wrapper}>
                <div className={styles.tabsWrapper}>
                    <div className={styles.tabs}>
                        <div className={styles.tabWrapper} >
                        
                            {boards.map( (item) => (
                                <div className={styles.tab} >
                                    <Link
                                        to={Paths.BOARDS.replace(':id', item.boardId)}
                                        title={item.boardId}
                                        className={styles.link}
                                    >
                                    {item.boardName}
                                    </Link>

                                </div>
                                ))}
                        </div>

                        <div onClick={onCreate}>
                            <Button icon="plus" className={styles.addButton} />
                        </div>
                    </div>
                </div>
            </div>
            {showCreateModal && <AddBoardModal setShowCreateModal={setShowCreateModal} />}                    
        </>
    )
}
export default Board;