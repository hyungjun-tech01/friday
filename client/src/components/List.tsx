import NameEdit from "./NameEdit";
import styles from "../scss/List.module.scss";
import {ICard} from "../atoms/atomCard";
import {apiGetCardsbyListId} from "../api/card";
import {useState, useEffect} from "react";
import Card from "./Card";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';
import {useTranslation} from "react-i18next";
import CardAdd from "./CardAdd";
import {useRecoilValue} from "recoil";
import {cardsbyListIdSelector} from "../atoms/atomsBoard";

interface IListProps{
    id:string;
    position:number;
    name : string;
}
function List({id, position, name}:IListProps){
    const [t] = useTranslation();
    const selectCards = useRecoilValue(cardsbyListIdSelector); // 호출 가능한 함수를 가져옴
//    console.log('isCardLoading',isCardLoading);
//    if(!isCardLoading) 
//        selectedCards = selectCards(id);
    
    const [isCardLoading, setIsCardLoading] = useState(true);
    const [cards, setCards] = useState<ICard[]>();
    const [isCardAddOpened, setIsCardAddOpened] = useState(false);
    const [isCardRequery, setIsCardRequery] = useState(false);
    
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
    return(
        <div className={styles.innerWrapper}>
        <div className={styles.outerWrapper}>
            <div className={styles.header}>
                <div className={styles.headerName}>{name}</div>
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