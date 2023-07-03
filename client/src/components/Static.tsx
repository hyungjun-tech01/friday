import Projects from "./Projects";
import Board from "./Board";
// project 가 선택되어 지면 board 를 표시 
// project 가 선택이 안되었으면 모든 프로젝트를 표시 
interface IStaticProps{
    projectId:string;
}
function Static({projectId}:IStaticProps){
    const queryProjectById = projectId ===undefined ?  false:true;
    console.log("projectId", projectId, queryProjectById);
    return(
        <div >
            {!queryProjectById && <Projects />}
            {queryProjectById &&<Board projectId={projectId}/> }
        </div>
    )
}
export default Static;