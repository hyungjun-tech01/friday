import { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState} from "recoil";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

import {projectSelector, IProject } from '../atoms/atomsProject';
import {atomCurrentMyBoard, ICheckBoardEditAuth} from "../atoms/atomsBoard";
import {apiGetCurrentBoards} from "../api/board";
import {useCookies} from "react-cookie";

import Fix from "../components/Fix";
import Static from "../components/Static";
import UsersModal from "../components/UsersModal";
import UserSettingModal from "../components/UserSettingModal";


interface ICoreParams {
    id : string;
}
function Core(){
  const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
  const {pathname} = useLocation();
  const IsDetail = pathname.includes('board');
  let IsMaster = pathname.includes('projects');
  
  const {id} = useParams<ICoreParams>();

  const [currentProject, setCurrentProject] = useState<IProject>({projectId:"", projectName:"", defaultBoardId:""});
  const [current, setCurrent] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useRecoilState(atomCurrentMyBoard);
  //const [currentBoardId, setCurrentBoardId] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState("");

  const selectProject  = useRecoilValue(projectSelector); 

  useEffect(() => {
    if(IsMaster){
      setCurrentProjectId(id);      
    
      if(currentProjectId !== undefined )
      {
        setCurrentProject(selectProject(id)[0]);
 
        setCurrentBoardId({...currentBoardId, boardId:""}); 
        setCurrent(true);

      }else{
        setCurrent(false);
      }
    }
    if(IsDetail){
      getCurrentBoard(id);
      setCurrent(true);
    }
    
  },[id,IsMaster, IsDetail,currentProjectId,selectProject]);  

  const getCurrentBoard = async (id:string) => {
    const response = await apiGetCurrentBoards({boardId:id, userId:cookies.UserId});
    if(response ) {
      setCurrentBoardId({...currentBoardId, boardId:id, users:response.users, labels:response.labels});
    }
  };

  
    const [currentModal, setCurrentModal] = useState(null);

  if(currentProject === undefined ){
    return (
      <>
      <Fix setCurrent={setCurrent} projectName={""} />
      <Static projectId="" boardId="" defaultBoardId=""/>
      </>
    );
  }else{
    return (
      <>
          <Fix setCurrent={setCurrent} projectName={current ? currentProject?.projectName:""} />
          {(!current)? <Static projectId="" boardId="" defaultBoardId=""/> :
            <Static projectId={currentProjectId} boardId={currentBoardId.boardId} defaultBoardId = {currentProject?.defaultBoardId} />}
          {currentModal === "USERS" && <UsersModal/>}
          {currentModal === "USER_SETTING" && <UserSettingModal/>}
      </>
    );
  }
//  {currentModal === "PROJECT_ADD" && <ProjectAddModal/>}

 /*    핵심 내용 기록해 놓을 것. 
    // recoil에서 atom에서 Project 데이터를 가지고 옴 -> 일차로 이것부터 구현해 본다.
    const [project, setProject] = useRecoilState<IProject[]>(atomMyProject); // atom에서 data 가지고 옴 .
    //New Project 화면 보여주기
    const [showNewProject, setShowNewProject] = useState(false);
    const userId = "967860418955445249";
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const {isLoading, data, isSuccess} = useQuery<IProject[]>(["allMyProjects", userId], ()=>apiGetProjects(userId),{
        onSuccess: data => {
           setProject(data);   // use Query 에서 atom에 set 
        },
        enabled : !showNewProject
      }
    );

     return (
        <SWrapper>
             { isSuccess && project.map(proj => ( <SBox key={proj.projectId}><SInfo>{proj.projectName}</SInfo></SBox>) )}
            <SLastBox onClick={()=>{setShowNewProject(true)}}><SInfo>프로젝트생성</SInfo></SLastBox>
            {showNewProject && <NewProject setshowNewProject={setShowNewProject}/>}
        </SWrapper>
    );
*/ 
};

export default Core;