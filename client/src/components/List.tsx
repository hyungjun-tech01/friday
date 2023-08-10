import NameEdit from "./NameEdit";
import styles from "../scss/List.module.scss";
import {ICard, defaultCard} from "../atoms/atomCard";
import {apiGetCardsbyListId} from "../api/card";
import {useState, useEffect} from "react";
import Card from "./Card";
import { ReactComponent as PlusMathIcon } from '../image/plus-math-icon.svg';
import {useTranslation} from "react-i18next";

interface IListProps{
    id:string;
    index:number;
    name : string;
}
    function List({id, index, name}:IListProps){
        const [t] = useTranslation();
    //    const selectCards = useRecoilValue(cardSelector); // 호출 가능한 함수를 가져옴
    //    console.log('isCardLoading',isCardLoading);
    //    if(!isCardLoading) 
    //        selectedCards = selectCards(id);
    //    console.log(id, selectedCards);
        
        const [isCardLoading, setIsCardLoading] = useState(true);
        const [cards, setCards] = useState<ICard[]>();
        const onQueryCards = async (id:string) => {
            const response = await apiGetCardsbyListId(id);    
            if(!response.message){
                console.log('카드조회', response);  
                setCards(response);
                setIsCardLoading(false);
                console.log(cards);
            }
        }
        useEffect(
            () => { onQueryCards(id); } ,[id]
        );
        const handleAddCardClick = () => {
            console.log('addcard');
        }
        return(
            <div className={styles.innerWrapper}>
            <div className={styles.outerWrapper}>
                <div className={styles.header}>
                    <div className={styles.headerName}>{name}</div>
                    <div className={styles.cards}>
                        {!isCardLoading&&cards?.map((card)=>(<Card key={card.cardId} card={card}/>))}
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
                </button>
                    </div>
                </div>
            </div>
            </div>
        );
    }
    export default List ; 