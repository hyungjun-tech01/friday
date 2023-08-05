
import {useState} from "react";
import {IList, atomMyList} from "../atoms/atomsList";
import {useRecoilState} from "recoil";
import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {apiGetLists} from "../api/list";
import List from "./List";
import styles from "../scss/Board.module.scss";
import ListAdd from "./ListAdd";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';

interface IListProps{
    boardId:string;
}
function Board({boardId}:IListProps){
    const [showList, setShowList] = useState(false);
    const [t] = useTranslation();
    //project id로 보드를 쿼리할 것.
    const [lists, setLists] = useRecoilState<IList[]>(atomMyList); 

    const {isLoading, data, isSuccess} = useQuery<IList[]>(["myBoardLists", boardId], ()=>apiGetLists(boardId),{
        onSuccess: data => {
            setLists(data);   // use Query 에서 atom에 set 
            console.log(showList);
            //setShowList((showList)=>(!showList));
        },
        enabled : !showList
      }
    );        
    const [isListAddOpened, setIsListAddOpened] = useState(false);
    const hasEditMembershipforBoard = () => {
        // useRecoilValue 
        console.log('hasEditMembership for board function');
        setIsListAddOpened((prev)=>(!prev));
    }
    return(
        <div className={`${styles.wrapper} ${styles.tabsWrapper}  ${styles.scroll}`}>
            <div className={`${styles.lists} ${styles.wrapperFlex}`}>
                {!isLoading && lists.map((list, index) => (
                        <List key={list.listId} id={list.listId} index={index} name={list.listName}/>
                        ))}

                <div data-drag-scroller className={styles.list}>
                {isListAddOpened ? (
                <ListAdd boardId={boardId} setShowList={setShowList} />
                ) : (
                <button
                    type="button"
                    className={styles.addListButton}
                    onClick={hasEditMembershipforBoard}
                >
                    <PlusMathIcon className={styles.addListButtonIcon} />
                    <span className={styles.addListButtonText}>
                    {lists.length > 0
                        ? t('action.addAnotherList')
                        : t('action.addList')}
                    </span>
                </button>
                )}
                </div>
            </div>
      </div>
    )
}

export default Board;