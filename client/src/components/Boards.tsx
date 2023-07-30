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

function Boards({projectId}:IBoardProps){
    //project id로 보드를 쿼리할 것.
    const [boards, setBoards] = useRecoilState<IBoard[]>(atomMyBoard); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 

    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const {isLoading, data, isSuccess} = useQuery<IBoard[]>(["allMyBoards", projectId], ()=>apiGetBoards(projectId),{
        onSuccess: data => {
            setBoards(data);   // use Query 에서 atom에 set 
            console.log(boards);
        },
        enabled : !showCreateModal
      }
    );    
    const [endXPosition, setEndXPostion] = useState(false);

    const onCreate = (event:React.MouseEvent<HTMLButtonElement>)=> {
       // console.log("create board");
       console.log(event.pageX,  window.innerWidth);
       // 만약 현재 클릭 위치가 window.innerWidth-300 보다 크다면 modal 을 왼쪽으로 띄우고 
       // 그렇지 않다면 오른쪽으로 띄운다.
       console.log(showCreateModal);
       setShowCreateModal((showCreateModal)=>(!showCreateModal));

       (window.innerWidth-300 < event.pageX) ? setEndXPostion(true):  setEndXPostion(false)
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
                        <div>
                            <Button icon="plus" onClick={onCreate} className={styles.addButton} />
                            {showCreateModal && <AddBoardModal endXPosition = {endXPosition} setShowCreateModal={setShowCreateModal} projectId={projectId} />}             
                        </div>
                        
                    </div>
                </div>
            </div>      
        </>
    )
}
export default Boards;