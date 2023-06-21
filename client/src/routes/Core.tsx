import React, {useState} from "react";
import styled from "styled-components";
import { useQuery } from "react-query";
import {useRecoilState} from "recoil";

import {apiGetProjects} from "../api/project";
import {atomMyProject, IProject} from '../atoms/atoms';
import NewProject from '../components/NewProject';
import { FOCUSABLE_SELECTOR } from "@testing-library/user-event/dist/utils";
import Fix from "../components/Fix";
import Static from "../components/Static";
import UsersModal from "../components/UsersModal";
import UserSettingModal from "../components/UserSettingModal";
import ProjectAddModal from "../components/ProjectAddModal";

const SWrapper = styled.div`
    display : flex;
    flex-wrap: wrap;
    width : 100%;
    align-items: center;
    position : relative;
    top:50px;
 `;
 const SBox = styled.div`
    background-color : #041f03;
    height: 150px;
    width : 250px;
    border-radius: 10px;
    margin-left : 10px;
    margin-right : 10px;
    margin-top : 10px;
    margin-bottom : 10px;
`;
const SLastBox = styled.div`
    background-color : white;
    height: 150px;
    width : 250px;
    border-radius: 10px;
    margin-left : 10px;
    margin-right : 10px;
    margin-top : 10px;
    margin-bottom : 10px;
    color : black;
    align-items: center;
`;
const SInfo = styled.div`
    font-size : 20px;
    padding : 20px;
    width : 100%;
    position : relative;
    bottom : -80px;
`
function Core(){
    const [currentModal, setCurrentModal] = useState(null);
return (
    <>
    <Fix />
    <Static />
    {currentModal === "USERS" && <UsersModal/>}
    {currentModal === "USER_SETTING" && <UserSettingModal/>}
    {currentModal === "PROJECT_ADD" && <ProjectAddModal/>}
    </>
);


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