import NameEdit from "./NameEdit";
import styles from "../scss/List.module.scss";
import {ICard, defaultCard} from "../atoms/atomCard";
import {apiGetCardsbyListId} from "../api/card";
import {useState, useEffect} from "react";

interface IListProps{
    id:string;
    index:number;
    name : string;
}

    function List({id, index, name}:IListProps){
    //    const selectCards = useRecoilValue(cardSelector); // 호출 가능한 함수를 가져옴
    //    console.log('isCardLoading',isCardLoading);
    //    if(!isCardLoading) 
    //        selectedCards = selectCards(id);
    //    console.log(id, selectedCards);
        
        const [isCardLoading, setIsCardLoading] = useState(true);
        const [cards, setCards] = useState<ICard[]>([defaultCard]);
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
        return(
            <div className={styles.innerWrapper}>
            <div className={styles.outerWrapper}>
                <div className={styles.header}>
                    <div className={styles.headerName}>{name}</div>
                    {cards.map((card)=>(<h1>card.cardName</h1>))}
                </div>
            </div>
            </div>
        );
    }
    export default List ; 