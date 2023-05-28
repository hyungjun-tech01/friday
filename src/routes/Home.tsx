import React from "react";
import styled from "styled-components";
import {useRecoilState} from "recoil";
import {myProject} from '../atoms/atoms';
const Wrapper = styled.div`
    position: fixed;   
    top:50px;
 `;
 const Box = styled.div`
    background-color : #006600;
    height: 200px;
    font-size: 66px;
`;
function Home(){
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // recoil에서 atom에서 Project 데이터를 가지고 옴 -> 일차로 이것부터 구현해 본다.
    const [project, setProject] = useRecoilState(myProject);
     return (
        <Wrapper>Home
            {project.map(proj => ( <Box>{proj.projectName}</Box>) )}
        </Wrapper>
    );
}

export default Home;