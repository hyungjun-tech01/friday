
import {useEffect, useState, useRef, useCallback} from "react";

import {IList, atomMyList} from "../atoms/atomsList";
import {listsSelector, atomCurrentMyBoard} from "../atoms/atomsBoard";
import {useRecoilState, useRecoilValue} from "recoil";
import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {apiGetLists} from "../api/list";
import {apiGetCurrentBoards} from "../api/board";
import List from "./List";
import styles from "../scss/Board.module.scss";
import ListAdd from "./ListAdd";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';
import { ICard, atomCurrentCard } from "../atoms/atomCard";
import CardModal from "./CardModal/CardModal";
import {useCookies} from "react-cookie";

interface IListProps{
    boardId:string;
}

function Board({boardId}:IListProps){
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [t] = useTranslation();
    const [showList, setShowList] = useState(false);
    const [currentBoard, setCurrentBoard] = useRecoilState(atomCurrentMyBoard);
    //board id로 리스트를 가지고 올것.
    const lists: IList[]  = useRecoilValue(listsSelector); 
   
    const getCurrentBoard = async (id:string) => {
        const response = await apiGetCurrentBoards({boardId:id, userId:cookies.UserId});
        if(response ) {
            setCurrentBoard({...currentBoard, ...response});
        }
    };

    //board id가 바뀔때마다 showList 를 변경 
    useEffect(() => {
        getCurrentBoard(boardId);
        setShowList(true);
    }, [boardId]);

    const [isListAddOpened, setIsListAddOpened] = useState(false);
    const hasEditMembershipforBoard = useCallback(() => {
        // useRecoilValue 
        console.log('hasEditMembership for board function');
        setIsListAddOpened((prev)=>(!prev));
    }, []);

    // Card ------------------------
    const currentCard = useRecoilValue<ICard>(atomCurrentCard);

    return (
        <div>
            <div className={`${styles.wrapper} ${styles.tabsWrapper}  ${styles.scroll}`}>
                <div className={`${styles.lists} ${styles.wrapperFlex}`}>
                    {currentBoard && lists.length > 0 && lists.map((list:any) => (
                            <List key={list.listId} id={list.listId} position={list.position} name={list.listName} canEdit={currentBoard.canEdit}/>
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
            </div>
            {(currentCard.cardId !== "") && <CardModal canEdit={currentBoard.canEdit}/>}
      </div>
    );
}

export default Board;