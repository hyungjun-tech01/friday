
import React, {useEffect, useState, useCallback} from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import {useCookies} from "react-cookie";
import {useTranslation} from "react-i18next";
import {useRecoilState, useRecoilValue} from "recoil";
import { defaultModifyList, IList, IModifyList } from "../atoms/atomsList";
import {listsSelector, atomCurrentMyBoard, ICurrent} from "../atoms/atomsBoard";
import { ICard, atomCurrentCard, IModifyCard, defaultModifyCard } from "../atoms/atomCard";
import {apiGetCurrentBoards} from "../api/board";
import { apiModifyCard } from "../api/card";
import { apiModifyList } from "../api/list";
import List from "./List";
import CardModal from "./CardModal/CardModal";
import styles from "../scss/Board.module.scss";
import ListAdd from "./ListAdd";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';
import { getNextPosition } from "../utils/position";
import {useRef} from "react";

const parseDndId = (dndId:string) => dndId.split(':')[1];
interface IListProps{
    boardId:string;
}

function Board({boardId}:IListProps){
    const prevPosition = useRef(null);
    const wrapper = useRef(null);

    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [t] = useTranslation();
    const [showList, setShowList] = useState(false);
    const [currentBoard, setCurrentBoard] = useRecoilState<ICurrent>(atomCurrentMyBoard);
    //board id로 리스트를 가지고 올것.
    const lists: IList[]  = useRecoilValue(listsSelector);
   
    const getCurrentBoard = async (id:string) => {
        const response = await apiGetCurrentBoards({boardId:id, userId:cookies.UserId});
        if(response ) {
            setCurrentBoard({...currentBoard, ...response});
        }
    };
    
    const handleMoveList = useCallback((id:string, toIndex: number) => {
        const selectedList = lists.filter((list) => list.listId === id)[0];
        const unselectedLists = lists.filter((list) => list.listId !== id);
        const updatedPosition = getNextPosition(unselectedLists, toIndex);
        const modifiedList: IModifyList = {
            ...defaultModifyList,
            userId: cookies.UserId,
            listActionType: 'UPDATE',
            position : updatedPosition,
        };
        const response = apiModifyList(modifiedList);
        response
            .then((result) => {
                if (result.message) {
                    console.log('Fail to move list', result.message);
                }
                else {
                    const updatedList = {
                        ...selectedList,
                        position : updatedPosition
                    };
                    const updatedLists = [
                        ...unselectedLists.slice(0, toIndex),
                        updatedList,
                        ...unselectedLists.slice(toIndex, ),
                    ];
                    const updatedBoard = {
                        ...currentBoard,
                        lists: updatedLists
                    };
                    setCurrentBoard(updatedBoard);
                };
            })
            .catch((message) => {
                console.log("Fail to update position of List : ", message);
            });
    }, [cookies.UserId, currentBoard, lists, setCurrentBoard]);

    const handleMoveCard = useCallback((id:string, toDest: string, toIndex: number) => {
        const current_idx = currentBoard.cards.findIndex(card => card.cardId === id);
        const selectedCard = currentBoard.cards[current_idx];
        const remainCardsExceptSelected = [
            ...currentBoard.cards.slice(0, current_idx),
            ...currentBoard.cards.slice(current_idx + 1,)
        ];
        const updatedPosition = getNextPosition(remainCardsExceptSelected, toIndex);
        const modifiedCard : IModifyCard = {
            ...defaultModifyCard,
            userId: cookies.UserId,
            cardId : id,
            listId : toDest,
            position : updatedPosition,
            cardActionType: 'MOVE',
        };
        const response = apiModifyCard(modifiedCard);
        response
        .then((result) => {
            if (result.message) {
                console.log('Fail to move card', result.message);
            } else {
                console.log(`Move info - Target list: ${toDest} / Target index: ${toIndex}`);
                const updatedCard = {
                    ...selectedCard,
                    listId : toDest,
                    position : updatedPosition,
                };
                const targetCards = currentBoard.cards.filter((card) => (card.listId === toDest && card.cardId !== id));
                let updatedCards: ICard[] = [];
                if(targetCards.length === 0){
                    updatedCards = [
                        ...remainCardsExceptSelected.slice(0, current_idx),
                        updatedCard,
                        ...remainCardsExceptSelected.slice(current_idx,)
                    ];
                } else {
                    if(toIndex !== targetCards.length) {
                        const target_idx = remainCardsExceptSelected.findIndex(card => card.cardId === targetCards[toIndex].cardId);
                        updatedCards = [
                            ...remainCardsExceptSelected.slice(0, target_idx),
                            updatedCard,
                            ...remainCardsExceptSelected.slice(target_idx,)
                        ];
                    } else {
                        const target_idx = remainCardsExceptSelected.findIndex(card => card.cardId === targetCards[toIndex - 1].cardId);
                        updatedCards = [
                            ...remainCardsExceptSelected.slice(0, target_idx + 1),
                            updatedCard,
                            ...remainCardsExceptSelected.slice(target_idx + 1, )
                        ];
                    }
                }
                const updatedCurrentBoard = {
                    ...currentBoard,
                    cards: updatedCards,
                };
                setCurrentBoard(updatedCurrentBoard);
            };
        })
        .catch((message) => {
            console.log('Fail to move card', message);
        });
    }, [cookies.UserId, currentBoard, setCurrentBoard]);

    const handleDragStart = useCallback(() => {
        document.dispatchEvent(new MouseEvent('click'));
    }, []);

    const handleDragEnd = useCallback((info: DropResult) => {
        const { draggableId, type, source, destination } = info;
        if (!destination
            || (source.droppableId === destination.droppableId
                && source.index === destination.index)
        ) {
            return;
        }
        // console.log("Board / handleDragEnd : ");
        // console.log("[draggableId] : ", draggableId);
        // console.log("[type] : ", type);
        // console.log("[source] : ", source);
        // console.log("[destination] : ", destination);
        const id = parseDndId(draggableId);
  
        switch (type) {
            case "list":
                handleMoveList(id, destination.index);
                break;
            case "card":
                handleMoveCard(id, parseDndId(destination.droppableId), destination.index);
                break;
            default:
        }
    }, [handleMoveList, handleMoveCard]);

    //board id가 바뀔때마다 showList 를 변경 
    useEffect(() => {
        getCurrentBoard(boardId);
        setShowList(true);
    }, [boardId]);



    
    const [isListAddOpened, setIsListAddOpened] = useState(false);
    const hasEditMembershipforBoard = useCallback(() => {
        // useRecoilValue 
        setIsListAddOpened((prev)=>(!prev));
    }, []);

    // Card ------------------------
    const currentCard = useRecoilValue<ICard>(atomCurrentCard);

    const handleMouseDown = useCallback(
        (event:any) => {
          // If button is defined and not equal to 0 (left click)
          if (event.button) {
            return;
          }
  
          if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
            return;
          }
  
          prevPosition.current = event.clientX;
        },
        [wrapper],
      );
  

    const handleWindowMouseMove = useCallback(
        (event:any) => {
          if (!prevPosition.current) {
            return;
          }
  
          event.preventDefault();
  
          window.scrollBy({
            left: prevPosition.current - event.clientX,
          });
  
          prevPosition.current = event.clientX;
        },
        [prevPosition],
      );

      const handleWindowMouseUp = useCallback(() => {
        prevPosition.current = null;
      }, [prevPosition]);

    useEffect(() => {
        if (isListAddOpened) {
          window.scroll(document.body.scrollWidth, 0);
        }
      }, [boardId, isListAddOpened]);

    useEffect(() => {
    document.body.style.overflowX = 'auto';

    return () => {
        document.body.style.overflowX = '';
    };
    }, []);

    useEffect(() => {
        window.addEventListener('mouseup', handleWindowMouseUp);
        window.addEventListener('mousemove', handleWindowMouseMove);
  
        return () => {
          window.removeEventListener('mouseup', handleWindowMouseUp);
          window.removeEventListener('mousemove', handleWindowMouseMove);
        };
      }, [handleWindowMouseUp, handleWindowMouseMove]);   

    return (
        <div>
            <div className={` ${styles.wrapper} ${styles.tabsWrapper} ${styles.scroll}`} >
                <div className={`${styles.lists} ${styles.wrapperFlex}`}>
                    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <Droppable droppableId="board" type="list" direction="horizontal">
                        {({ innerRef, droppableProps, placeholder }) => (
                            <div {...droppableProps} data-drag-scroller ref={innerRef} className={styles.lists}>
                                {currentBoard && lists.length > 0 && lists.map((list:any, index:number) => (
                                    <List key={list.listId} index={index} id={list.listId} position={list.position} name={list.listName} canEdit={list.createUserId === cookies.UserId ? true: currentBoard.canEdit}/>
                                ))}
                                {placeholder}
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
                        )}
                        </Droppable>
                    </DragDropContext>
                </div>
                {(currentCard.cardId !== "") && <CardModal canEdit={currentCard.creatorUserId === cookies.UserId ? true: currentBoard.canEdit} />}
            </div>
        </div>
    );
}

export default Board;