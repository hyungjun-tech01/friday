interface IListProps{
    key:string;
    id:string;
    index:number;
    name : string;
}

function List({key, id, index, name}:IListProps){
    return(
        <div>list Name : {name} </div>
    );
}
export default List ; 