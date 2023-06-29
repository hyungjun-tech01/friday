
import { useRecoilState } from "recoil";
import {useQuery} from "react-query";
import { Container, Grid } from 'semantic-ui-react';

import {atomMyProject,IProject} from "../atoms/atoms";
import {apiGetProjects} from "../api/project";
import styles from "./Projects.module.scss";

function Projects(){
    // atom에서 data 가지고 옴 .   
    const [projects, setProjects] = useRecoilState<IProject[]>(atomMyProject); 
    // login 하면 가지고 있을 것.  const [user, setUser] = useRecoilState<IUser>(atomUser); 
    const userId = "967860418955445249";
    // useQuery 에서 db에서 데이터를 가지고 와서 atom에 세팅 후에     
    // useQuery(['todos', todoId], () => fetchTodoById(todoId))
    const {isLoading, data, isSuccess} = useQuery<IProject[]>(["allMyProjects", userId], ()=>apiGetProjects(userId),{
        onSuccess: data => {
           setProjects(data);   // use Query 에서 atom에 set 
        },
       /* enabled : !showNewProject */
      }
    );
    return(
        <div >
            Project
            <Container className={styles.cardsWrapper}>
                <Grid className={styles.gridFix}>
                    {projects.map( (item) => (
                        <Grid.Column key={item.projectId} mobile={8} computer={4}>
                            <div className={styles.openTitle}>{item.projectName}</div>
                        </Grid.Column>
                    )
                    )}
                </Grid>
            </Container>    
        </div>
    )
}
export default Projects;