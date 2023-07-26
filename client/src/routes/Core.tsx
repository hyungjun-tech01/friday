import React, {useState} from "react";
import styled from "styled-components";
import { useQuery } from "react-query";
import {useRecoilState, useRecoilValue} from "recoil";
import {useParams} from "react-router";
import { useLocation } from "react-router-dom";

import {apiGetProjectbyId} from "../api/project";
import {atomCurrentProject, IProject, getCurrentProject} from '../atoms/atomsProject';

import {atomCurrentMyBoard, ICurrent} from '../atoms/atomsBoard';
import NewProject from '../components/NewProject';
import { FOCUSABLE_SELECTOR } from "@testing-library/user-event/dist/utils";
import Fix from "../components/Fix";
import Static from "../components/Static";
import UsersModal from "../components/UsersModal";
import UserSettingModal from "../components/UserSettingModal";
import ProjectAddModal from "../components/ProjectAddModal";

const SCore = styled.div`
    width: 100%;
    height: 100%;
    background: #22252a;  /*index의 background 하고 색상을 맞추어야 함.*/
`;
interface ICoreParams {
    id : string;
}
function Core(){
    const {pathname} = useLocation();
    const IsDetail = pathname.includes('board');
    const IsMaster = pathname.includes('projects');

    const {id} = useParams<ICoreParams>();

    const [currentProject, setCurrentProject] = useRecoilState<IProject[]>(atomCurrentProject);
    const [current, setCurrent] = useState(false);
    

  //project id로 project 쿼리할 것.
//  const [project, setProject] = useRecoilState<IProject[]>(atomCurrentProject); 
  // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 
  const userId = "967860418955445249";
  // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
  // useQuery(['todos', todoId], () => fetchTodoById(todoId))

  //const queryProjectById = id===undefined ?  false:true;

  const {isLoading, data, isSuccess} = useQuery<IProject[]>(["projectById", id], ()=>apiGetProjectbyId(id),{
    onSuccess: data => {
        setCurrentProject(data);   // use Query 에서 atom에 set 
        console.log("cccccccccccccore", currentProject);
        setCurrent(true);
       },
         enabled : IsMaster
        }   
    ); 
    const [currentModal, setCurrentModal] = useState(null);
   
    return (
    <SCore>
        <Fix setCurrent={setCurrent} projectName={current ? currentProject[0].projectName:""} />
        {!current ? <Static projectId="" boardId=""/> :
        <Static projectId={currentProject[0].projectId} boardId={IsDetail? id:""}/>}
        {currentModal === "USERS" && <UsersModal/>}
        {currentModal === "USER_SETTING" && <UserSettingModal/>}
      
    </SCore>
);

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
}

export default Core;