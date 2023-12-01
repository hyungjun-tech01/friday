import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {IBoard, IQueryBoard, atomMyBoard, atomCurrentMyBoard, IModifyBoard, defaultModifyBoard} from "../../atoms/atomsBoard";
import {useQuery} from "react-query";
import { Button, Icon } from 'semantic-ui-react';
import {Link} from "react-router-dom";
import React, {useState, useEffect, useCallback} from "react";
import {useCookies} from "react-cookie";
import {apiGetBoards, apiModifyBoard} from "../../api/board";
import styles from "./Boards.module.scss";
import Paths from "../../constants/Paths";
import AddBoardModal from "../AddBoardModal";
import classNames from "classnames";
import {projectSelector, IProject, atomMyProject, projectSetter} from "../../atoms/atomsProject";
import EditStep from "./EditStep";
import { usePopup } from '../../lib/hook';
import pick from 'lodash/pick';
import {apiGetProjects} from "../../api/project";
import { useHistory } from "react-router-dom"; 

interface IBoardProps{
    projectId:string;
}

function Boards({projectId}:IBoardProps){
    const [cookies, setCookie, removeCookie] = useCookies(['UserId','UserName', 'AuthToken']);
    const history = useHistory();
    //project id로 보드를 쿼리할 것.
    const [boards, setBoards] = useRecoilState<IBoard[]>(atomMyBoard); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isBoardLoading, setIsBoardLoading] = useState(true);
    const currentBoardId = useRecoilValue(atomCurrentMyBoard);
    

    // 현재 user 는 이 프로젝트에 어떤 권한을 가지고 있는지.
    const currentProject2 = useRecoilValue(projectSelector);
    const currentProject1 = currentProject2(projectId)[0];
    const currentSetProject = useSetRecoilState(projectSetter);

    const isEdit = currentProject1.isAdmin || currentProject1.role === "manager" ? true : false;

    const EditPopup = usePopup(EditStep);
    //console.log("Board currentProject", currentProject1.projectId, currentProject1.role, currentProject1.isAdmin);

    //board id가 바뀔때마다 showList 를 변경 
    useEffect(() => {
        setIsBoardLoading(true);
    }, [projectId, showCreateModal]);

    //!showCreateModal||
    const queryCond:IQueryBoard = {"userId":cookies.UserId, "projectId":projectId};
    const {isLoading, data, isSuccess} = useQuery<IBoard[]>(["allMyBoards", queryCond], ()=>apiGetBoards(queryCond),{
        onSuccess: data => {
            setBoards(data);   // use Query 에서 atom에 set 
            setIsBoardLoading(false);
        },
        enabled : isBoardLoading
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
        //   보드 이름 업데이트 
        async (id:any, data:any) => {
          const updateBoard : IModifyBoard ={...defaultModifyBoard, 
            boardActionType : 'UPDATE',
           boardId:id, boardName:data,
           userId : cookies.UserId};
       
          const response = await apiModifyBoard(updateBoard);
          if(response){
            if(response.boardId){
                // board 다시 쿼리 useQuery 
                setIsBoardLoading(true);
              }else if(response.message){
                console.log(response.message);
              }else{
                
              }
          }
        },
        [],
    );
   
    const handleDelete = useCallback(
      async (id:any) => {
        console.log('boards',boards);
          // 보드삭제
          const updateBoard : IModifyBoard ={...defaultModifyBoard, 
            boardActionType : 'DELETE',
            boardId:id, 
            userId : cookies.UserId};

            const response = await apiModifyBoard(updateBoard);
            if(response){
              if(response.boardId){
                  // 지우려는 보드가 defaultboard 면 , default 보드를 변경하는 작업을 해야 함.
                  if( currentProject1.defaultBoardId === id){
                      const nextdefaultBoard = boards.filter((board) => board.boardId !== id);
                      if(nextdefaultBoard.length >= 1){
                      const updatedProject:IProject = {...currentProject1, defaultBoardId:nextdefaultBoard[0].boardId};
                      currentSetProject([updatedProject]);
                      }else{
                      const updatedProject:IProject = {...currentProject1, defaultBoardId:''};
                      currentSetProject([updatedProject]);
                      }
                  }

                  setIsBoardLoading(true);    
                  history.push(Paths.PROJECTS.replace(':id', projectId));   //   project 화면
                }else if(response.message){
                  console.log(response.message);
                }else{
              
                }
            }
      },
      [boards],
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
                                          defaultData={pick(item, ['boardName'])}
                                          onUpdate={(data:any) => handleUpdate(item.boardId, data)}
                                          onDelete={() => handleDelete(item.boardId)}
                                          canEdit = {isEdit}
                                        >
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