
interface IListProps{
    boardId:string;
}

function List({boardId}:IListProps){
    return(
        <div>
            List : {boardId}
        </div>
    )
}

export default List;