
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
import { atomCurrentCardId } from "../atoms/atomCard";
//import {apiGetCards} from "../api/card";

//import {cardSelector} from "../atoms/atomCard";
//import {useRecoilValue} from "recoil";
import CardModal from "./CardModal";

interface IListProps{
    boardId:string;
}
function Board({boardId}:IListProps){
    const [showList, setShowList] = useState(false);
    const [t] = useTranslation();

    //board id로 리스트를 쿼리할 것.
    const [lists, setLists] = useRecoilState<IList[]>(atomMyList); 

    const {isLoading, data } = useQuery<IList[]>(["myBoardLists", boardId], ()=>apiGetLists(boardId),{
        onSuccess: data => {
            setLists(data);   // use Query 에서 atom에 set 
            console.log('showList', showList);
            setShowList((showList)=>(!showList));
        },
        enabled : !showList
      }
    );
    const cardId = useRecoilValue<string>(atomCurrentCardId);
    console.log("Selected Card Id is ", cardId);

    // board id 로 카드를 모두 쿼리 . atom에 보관 후 -> 리스트 id로 selector를 통해서 가지고 올것. 
    // 만약 이렇게 한다면, 카드를 변경해도 atom을 갱신해야 함.
//    const [cards, setCards] = useRecoilState<ICard[]>(atomMyCards);
//    const [isCardLoading, setIsCardLoading] = useState(true);
//    const cardData = useQuery<ICard[]>(["allMyCards", boardId], ()=>apiGetCards(boardId),{
//        onSuccess: data => {
//            setCards(data);   // use Query 에서 atom에 set 
//            console.log('showList', showList);
//            setIsCardLoading(false);
//        },
//        enabled : !showList
//      }
//    );
//

    const [isListAddOpened, setIsListAddOpened] = useState(false);
    const hasEditMembershipforBoard = useCallback(() => {
        // useRecoilValue 
        console.log('hasEditMembership for board function');
        setIsListAddOpened((prev)=>(!prev));
    }, []);
    console.log("List Info", showList, lists);
    // useEffect(() => {
    //     const handleOutsideClose = (e: {target: any}) => {
    //         // useRef current에 담긴 엘리먼트 바깥을 클릭 시 드롭메뉴 닫힘
    //       if(isListAddOpened && (!addListElement.current.contains(e.target)))
    //         console.log('inside effect', isListAddOpened);
    //            setIsListAddOpened(false);
    //            console.log('inside effect', isListAddOpened);
    //     };

    //     document.addEventListener('click', handleOutsideClose);
        
    //     return () => document.removeEventListener('click', handleOutsideClose);
    //   }, [isListAddOpened]);
    
 //   const selectCards = useRecoilValue(cardSelector); // 호출 가능한 함수를 가져옴
 //   console.log('isCardLoading',cards);
 //   let selectedCards:ICard[] = [];
 //   if(!isCardLoading) {
 //       selectedCards = selectCards("1016265575850050659");
 //       console.log('1016265575850050659', selectedCards);
 //   }

    useEffect(()=>setShowList(false), [boardId]);

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
            </div>
            { !!cardId && <CardModal id={cardId} canEdit={true}/>}
      </div>
    )
}

export default Board;