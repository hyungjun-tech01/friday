
import { useRecoilState } from "recoil";
import {useQuery} from "react-query";
import { Container, Grid } from 'semantic-ui-react';
import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useCookies} from "react-cookie";
import {atomMyProject,IProject, atomProjectsToLists} from "../atoms/atomsProject";
import {apiGetProjects} from "../api/project";
import styles from "../scss/Projects.module.scss";
import { ReactComponent as PlusIcon } from '../image/plusicon.svg';
import ProjectAddModal from "./ProjectAddModal";
import Paths from "../constants/Paths";
import { apiGetBoards } from "../api/board";
import { IBoard } from "../atoms/atomsBoard";

function Projects(){
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    // atom에서 data 가지고 옴 .   
    const [projects, setProjects] = useRecoilState<IProject[]>(atomMyProject); 
    const [showProjectAddModal, setShowProjectAddModal] = useState(false);
    // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 
    const userId = cookies.UserId;
    const [projectsToLists, setProjectsToLists] = useRecoilState(atomProjectsToLists);
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const {isLoading, data, isSuccess} = useQuery<IProject[]>(["allMyProjects", userId], ()=>apiGetProjects(userId),{
        onSuccess: data => {
           setProjects(data);   // use Query 에서 atom에 set
        },
        enabled : !showProjectAddModal
      }
    );
    const onAdd = ()=>{
        console.log("add project");
        setShowProjectAddModal(true);
    }

    useEffect(() => {
        if(projects) {
            const realProject = projects.filter((project) => project.projectId !== "");
            realProject.forEach((project:IProject) => {
                // Get boards
                const respBoards = apiGetBoards({projectId: project.projectId, userId: cookies.UserId});
                respBoards
                    .then((resBoard) => {
                        if(resBoard.message) {
                            console.log('[Projects] Response has message :', resBoard.message);
                            if(project.projectId !=="") {
                                setProjectsToLists((prev) => [...prev, {
                                    id: project.projectId,
                                    name: project.projectName,
                                    boards: [],
                                }]);
                            }
                        }
                        else {
                            //console.log('[Projects] Response has data :', resBoard);
                            const updateBoards = resBoard.map((board: IBoard) => ({
                                id: board.boardId,
                                name: board.boardName,
                                lists: [],
                                isFetching: null,
                            }));
                            setProjectsToLists((prev) => [...prev, {
                                id: project.projectId,
                                name: project.projectName,
                                boards: updateBoards,
                            }]);
                        };
                    })
                    .catch((error) => {
                        console.log('[Projects] Fail to get Boards :', error);
                        if(project.projectId !=="") {
                            setProjectsToLists((prev) => [...prev, {
                                id: project.projectId,
                                name: project.projectName,
                                boards: [],
                            }]);
                        }
                    });
            });
        }
    }, [cookies.UserId, projects]);

    return(
        <div className={styles.projects}>
            Project
            <Container className={styles.cardsWrapper}>
                <Grid className={styles.gridFix}>
                    {projects.map( (item) => (
                        <Grid.Column key={item.projectId} mobile={8} computer={4}>
                            <Link to={ Paths.PROJECTS.replace(':id', item.projectId) }>
                            <div className={`${styles.open} ${styles.card}`}>
                                <div className={styles.openTitle}>{item.projectName}</div>
                            </div>
                            </Link>
                        </Grid.Column>
                    )
                    )}
                    <Grid.Column mobile={8} computer={4}>
                        <button type="button" className={`${styles.card}, ${styles.add}`} onClick={onAdd}>
                          <div className={styles.addTitleWrapper}>
                            <div className={styles.addTitle}>
                              <PlusIcon className={styles.addGridIcon} />
                              프로젝트 생성
                            </div>
                          </div>
                        </button>
                  </Grid.Column>
                </Grid>
            </Container>    
            {showProjectAddModal&&<ProjectAddModal setShowProjectAddModal={setShowProjectAddModal}/>}
        </div>
    )
}
export default Projects;