import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { ICard, atomCurrentCard } from "../atoms/atomCard";
import styles from "../scss/Card.module.scss";

interface ICardProps{
    card:ICard;
};

function Card({card}:ICardProps){
    const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
    const handleCardClick = useCallback(() => {
        console.log('Card is clicked : ', card.cardId);
        // if (document.activeElement) {
        //     (document.activeElement as HTMLElement).blur();;
        // };
        if(card) setCurrentCard(card);
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className = {styles.card}>
                <div className = {styles.content} >
                    <div 
                        title={card.cardId}
                        className={styles.name}
                        onClick={handleCardClick}
                    >
                        <div className={styles.details}>
                            {card.cardName}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;