import React from "react";
import styled from "styled-components";
import {useRecoilState} from "recoil";
import {myProject} from '../atoms/atoms';
const Wrapper = styled.div`
    display : flex;
    flex-wrap: wrap;
    width : 100%;
    align-items: center;
    position : relative;
    top:50px;
 `;
 const Box = styled.div`
    background-color : #041f03;
    height: 150px;
    width : 250px;
    border-radius: 10px;
    margin-left : 10px;
    margin-right : 10px;
    margin-top : 10px;
    margin-bottom : 10px;
`;
const LastBox = styled.div`
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
const Info = styled.div`
    font-size : 20px;
    padding : 20px;
    width : 100%;
    position : relative;
    bottom : -80px;
`
function Home(){
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // recoil에서 atom에서 Project 데이터를 가지고 옴 -> 일차로 이것부터 구현해 본다.
    const [project, setProject] = useRecoilState(myProject);
     return (
        <Wrapper>Home
            {project.map(proj => ( <Box><Info>{proj.projectName}</Info></Box>) )}
            <LastBox><Info>프로젝트생성</Info></LastBox>
        </Wrapper>
    );
}

export default Home;