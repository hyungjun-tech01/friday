import {useRecoilState, useRecoilValue} from "recoil";
import {IBoard, IQueryBoard, atomMyBoard, atomCurrentMyBoard} from "../atoms/atomsBoard";
import {useQuery} from "react-query";
import { Button, Icon } from 'semantic-ui-react';
import {Link} from "react-router-dom";
import {useState, useEffect} from "react";
import {useCookies} from "react-cookie";
import {apiGetBoards} from "../api/board";
import styles from "../scss/Boards.module.scss";
import Paths from "../constants/Paths";
import AddBoardModal from "./AddBoardModal";
import classNames from "classnames";

interface IBoardProps{
    projectId:string;
}

function Boards({projectId}:IBoardProps){
    const [cookies, setCookie, removeCookie] = useCookies(['UserId','UserName', 'AuthToken']);
    //project id로 보드를 쿼리할 것.
    const [boards, setBoards] = useRecoilState<IBoard[]>(atomMyBoard); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isBoardLoading, setIsBoardLoading] = useState(false);
    const currentBoardId = useRecoilValue(atomCurrentMyBoard);
    // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 

    //board id가 바뀔때마다 showList 를 변경 
    useEffect(() => {
        setIsBoardLoading(true);
    }, [projectId, showCreateModal]);

    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const queryCond:IQueryBoard = {"userId":cookies.UserId, "projectId":projectId};
    const {isLoading, data, isSuccess} = useQuery<IBoard[]>(["allMyBoards", queryCond], ()=>apiGetBoards(queryCond),{
        onSuccess: data => {
            setBoards(data);   // use Query 에서 atom에 set 
            setIsBoardLoading(false);
        },
        enabled : !showCreateModal||isBoardLoading
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
                                <div key={item.boardId} className={classNames(styles.tab, item.boardId === currentBoardId.boardId && styles.tabActive)} >
                                    <Link
                                        key={item.boardId}
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