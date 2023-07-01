import Projects from "./Projects";
import Board from "./Board";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
}
function Static({projectId}:IStaticProps){
    console.log("projectId"+projectId);
    return(
        <div >
            {!projectId && <Projects />}
            {projectId &&<Board projectId={projectId}/> }
        </div>
    )
}
export default Static;