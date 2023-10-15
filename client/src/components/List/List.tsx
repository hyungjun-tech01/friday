import {useState, useEffect, useCallback, useRef} from "react";
import { ReactComponent as PlusMathIcon } from '../../image/plus-math-icon.svg';
import {useTranslation} from "react-i18next";
import {useRecoilValue, useSetRecoilState} from "recoil";
import styles from "./List.module.scss";
import { useCookies } from 'react-cookie';
import classNames from 'classnames';
import { Button,  Icon,  } from 'semantic-ui-react';

import {ICard} from "../../atoms/atomCard";
import {IModifyList, defaultModifyList, IList} from "../../atoms/atomsList";
import Card from "../Card";
import CardAdd from "../CardAdd";
import {cardsbyListIdSelector, listSelector} from "../../atoms/atomsBoard";
import NameEdit from "./NameEdit";
import {apiModifyList} from "../../api/list";
import usePopup from '../../lib/hook/use-popup';
import ActionsStep from './ActionsStep';

interface IListProps{
    id:string;
    position:number;
    name : string;
    canEdit : boolean;
}
function List({id, position, name, canEdit}:IListProps){
    const list = useRecoilValue(listSelector(id));
    const setList = useSetRecoilState(listSelector(id));
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
    const selectCards = useRecoilValue(cardsbyListIdSelector); // 호출 가능한 함수를 가져옴
    
    const [isCardLoading, setIsCardLoading] = useState(true);
    const [cards, setCards] = useState<ICard[]>();
    const [isCardAddOpened, setIsCardAddOpened] = useState(false);
    const [isCardRequery, setIsCardRequery] = useState(false);
    const nameEdit = useRef<any>(null);
    const ActionsPopup = usePopup(ActionsStep);
    
    const onQueryCards = async () => {
        setIsCardLoading(true);
        setCards(selectCards(id));
        console.log('list card', id, cards);
        // const response = await apiGetCardsbyListId(id);
        // if(response){
        //     console.log('카드조회', response);  
        //     setCards(response);
        //     setIsCardLoading(false);
        //     console.log(cards);
        // }
    };

    useEffect(
        () => { setIsCardLoading(true); 
                onQueryCards();  
                setIsCardLoading(false);
            } ,[id, isCardRequery]
    );

    
    const handleAddCardClick = () => {
        console.log('addcard');
        setIsCardAddOpened(true);
     };

     const handleNameUpdate = useCallback(
        (data: string) => {
          console.log('Udate name of list : ', data);
          const modifiedList: IModifyList = {
            ...defaultModifyList,
            listId:list.listId,
            userId: cookies.UserId,
            listName: data,
            listActionType: 'UPDATE',
          };
    
          const response = apiModifyList(modifiedList);
          response
            .then((result) => {
              if (result.message) {
                console.log('Fail to update name of card', result.message);
              } else {
                console.log('Succeed to update name of card', result);
                const updatedList = {
                  ...list,
                  listName: data,
                };
                setList(updatedList);
              }
            })
            .catch((message) => {
              console.log('Fail to update name of card', message);
            });
        },
        [list, cookies, setList]
      );
    const onDelete = ()=>{

    }
    const handleCardAdd = ()=>{

    }
    const handleNameEdit = useCallback(() => {
      console.log('handleNameEdit');
      if (nameEdit.current) {
        nameEdit.current.open();
      }
    }, []);

    const handleHeaderClick = useCallback(() => {
      if (canEdit) {
        nameEdit.current.open();
      }
    }, [canEdit]);
    return(
        <div className={styles.innerWrapper}>
        <div className={styles.outerWrapper}>
            <div className={styles.header}>
                {canEdit  ? (
                <div className={styles.headerName} onClick={handleHeaderClick}>
                    <NameEdit ref={nameEdit} 
                        defaultValue={list.listName}
                        size='Small'
                        onUpdate={handleNameUpdate} >
                          <div className={styles.headerName}>{list.listName}</div>
                    </NameEdit>
                    <ActionsPopup
                        onNameEdit={handleNameEdit}
                        onCardAdd={handleCardAdd}
                        onDelete={onDelete}
                      >
                      <Button className={classNames(styles.button, styles.target)}>
                        <Icon fitted name="pencil" size="small" />
                      </Button>
                    </ActionsPopup>                      
                </div>
              ) : (
                <div className={styles.headerName}>{list.listName}</div>
              )}
            </div>
            <div className={`${styles.cardsInnerWrapper} ${styles.cardsInnerWrapperFull}`}>
            <div className={styles.cardsOuterWrapper}>
                <div className={styles.cards}>
                    {!isCardLoading&&cards?.map((card)=>(<Card key={card.cardId} cardId={card.cardId}/>))}
                    {isCardAddOpened&&<CardAdd listId={id} setIsCardAddOpened={setIsCardAddOpened} isCardRequery={isCardRequery} setIsCardRequery={setIsCardRequery}/>}
                    {!isCardAddOpened&&(
                        <button
                        type="button"
                        className={styles.addCardButton}
                        onClick={handleAddCardClick}
                    >
                        <PlusMathIcon className={styles.addCardButtonIcon} />
                        <span className={styles.addCardButtonText}>
                            {cards  && ( t('action.addAnotherCard') )} 
                            {!cards && ( t('action.addCard'))}
                        </span>
                    </button>)}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
export default List ; 