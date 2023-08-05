
import {useState} from "react";
import {IList, atomMyList} from "../atoms/atomsList";
import {useRecoilState} from "recoil";
import {useQuery} from "react-query";
import {apiGetLists} from "../api/list";
import List from "./List";
import styles from "../scss/Board.module.scss";

interface IListProps{
    boardId:string;
}
function Board({boardId}:IListProps){
    const [showList, setShowList] = useState(false);
    //project id로 보드를 쿼리할 것.
    const [lists, setLists] = useRecoilState<IList[]>(atomMyList); 

    const {isLoading, data, isSuccess} = useQuery<IList[]>(["myBoardLists", boardId], ()=>apiGetLists(boardId),{
        onSuccess: data => {
            setLists(data);   // use Query 에서 atom에 set 
            console.log(showList);
        },
        enabled : !showList
      }
    );        
    return(
        <div className={styles.lists}>
            {lists.map((list, index) => (
                      <List key={list.listId} id={list.listId} index={index} name={list.listName}/>
                    ))}
        </div>
    )
}

export default Board;