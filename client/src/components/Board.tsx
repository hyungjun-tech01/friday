interface IBoardProps{
    projectId:string;
}

function Board({projectId}:IBoardProps){
    //project id로 보드를 쿼리할 것.
    return(
        <div>
            Board : ProjectId = {projectId}
        </div>
    )
}
export default Board;