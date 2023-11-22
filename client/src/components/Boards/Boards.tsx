import {useRecoilState, useRecoilValue} from "recoil";
import {IBoard, IQueryBoard, atomMyBoard, atomCurrentMyBoard} from "../../atoms/atomsBoard";
import {useQuery} from "react-query";
import { Button, Icon } from 'semantic-ui-react';
import {Link} from "react-router-dom";
import React, {useState, useEffect, useCallback} from "react";
import {useCookies} from "react-cookie";
import {apiGetBoards} from "../../api/board";
import styles from "./Boards.module.scss";
import Paths from "../../constants/Paths";
import AddBoardModal from "../AddBoardModal";
import classNames from "classnames";
import {projectSelector} from "../../atoms/atomsProject";
import EditStep from "./EditStep";
import { usePopup } from '../../lib/hook';
import pick from 'lodash/pick';

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

    // 현재 user 는 이 프로젝트에 어떤 권한을 가지고 있는지.
    const currentProject = useRecoilValue(projectSelector);
    const currentProject1 = currentProject(projectId)[0];
    const isEdit = currentProject1.isAdmin || currentProject1.role === "manager" ? true : false;

    const EditPopup = usePopup(EditStep);
    //console.log("Board currentProject", currentProject1.projectId, currentProject1.role, currentProject1.isAdmin);

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
       // 만약 현재 클릭 위치가 window.innerWidth-300 보다 크다면 modal 을 왼쪽으로 띄우고 
       // 그렇지 않다면 오른쪽으로 띄운다.
       setShowCreateModal((showCreateModal)=>(!showCreateModal));
       (window.innerWidth-300 < event.pageX) ? setEndXPostion(true):  setEndXPostion(false)
    };
    const handleUpdate = useCallback(
        (id:any, data:any) => {
          console.log(id, data);
       //   onUpdate(id, data);
        },
        [],
      );
    
      const handleDelete = useCallback(
        (id:any) => {
            console.log(id);
        //  onDelete(id);
        },
        [],
      );
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
                                    {isEdit && (
                                        <EditPopup
                                        defaultData={pick(item, 'boardName')}
                                        onUpdate={(data:any) => handleUpdate(item.boardId, data)}
                                        onDelete={() => handleDelete(item.boardId)} >
                                            <Button className={classNames(styles.editButton, styles.target)}>
                                            <Icon fitted name="pencil" size="small" />
                                            </Button>
                                        </EditPopup>
                                       )}
                                </div>
                                ))}
                        </div>
                        {isEdit &&
                            <div>
                            <Button icon="plus" onClick={onCreate} className={styles.addButton} />
                            {showCreateModal && <AddBoardModal endXPosition = {endXPosition} setShowCreateModal={setShowCreateModal} projectId={projectId} />}             
                        </div>}
                        
                    </div>
                </div>
            </div>      
        </>
    )
}
export default Boards;