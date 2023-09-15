
import {useEffect, useState, useRef, useCallback} from "react";

import {IList, atomMyList} from "../atoms/atomsList";
import {useRecoilState, useRecoilValue} from "recoil";
import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {apiGetLists} from "../api/list";
import List from "./List";
import styles from "../scss/Board.module.scss";
import ListAdd from "./ListAdd";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';
import { ICard, atomCurrentCard } from "../atoms/atomCard";
import {useCookies} from "react-cookie";
import {apiCheckEditBoard} from "../api/board";
import { ICheckBoardEditAuth, IBoardUser } from "../atoms/atomsBoard";
import CardModal from "./CardModal";

interface IListProps{
    boardId:string;
}
function Board({boardId}:IListProps){
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [boardUsers, setBoardUsers] = useState<IBoardUser[]>([]);
    const checkBoardUsers = async () => {
        const checkAuth:ICheckBoardEditAuth= {"boardId":boardId, "userId":cookies.UserId };
        const response = await apiCheckEditBoard(checkAuth);
        if(response.messsage){
            console.log("Fail to get response ....", response.message);
        }else{
            if(response && response[0] && response[0].users) {
                setBoardUsers(response[0].users);
            } else {
                console.log("Fail to get board users...", response);
            };
        };
    };

    const [showList, setShowList] = useState(false);
    //board id로 리스트를 쿼리할 것.
    const [lists, setLists] = useRecoilState<IList[]>(atomMyList);

    //board id가 바뀔때마다 showList 를 변경 
    useEffect(() => {
        setShowList(true);
        checkBoardUsers();
    }, [boardId]);

    const {isLoading, data } = useQuery<IList[]>(["myBoardLists", boardId], ()=>apiGetLists(boardId),{
        onSuccess: data => {
            setLists(data);   // use Query 에서 atom에 set 
            setShowList(false);
        },
        enabled : showList
      }
    );

    const [isListAddOpened, setIsListAddOpened] = useState(false);
    const hasEditMembershipforBoard = useCallback(() => {
        // useRecoilValue 
        console.log('hasEditMembership for board function');
        setIsListAddOpened((prev)=>(!prev));
    }, []);

    // Card ------------------------
    const currentCard = useRecoilValue<ICard>(atomCurrentCard);

    return(
        <div>
            <div className={`${styles.wrapper} ${styles.tabsWrapper}  ${styles.scroll}`}>
                <div className={`${styles.lists} ${styles.wrapperFlex}`}>
                    {!isLoading && lists.map((list, index) => (
                            <List key={list.listId} id={list.listId} index={index} name={list.listName} />
                            ))}

                    <div data-drag-scroller className={styles.list}>
                    {isListAddOpened ? (
                    <ListAdd  boardId={boardId} setShowList={setShowList} setIsListAddOpened={setIsListAddOpened} />
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
            </div>[]
            {(currentCard.cardId !== "") && <CardModal boardUsers={boardUsers} card={currentCard} canEdit={true}/>}
      </div>
    )
}

export default Board;