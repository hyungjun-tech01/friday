interface IBoardActionProp{
    boardId:string;
}
function BoardAction({boardId}:IBoardActionProp){
    return(
        <div>
            membership, lable, status {boardId}
        </div>
    );
}
export default BoardAction;