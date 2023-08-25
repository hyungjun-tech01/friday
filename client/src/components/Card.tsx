import { useCallback } from "react";
import { Link } from 'react-router-dom';
import {ICard} from "../atoms/atomCard";
import Paths from '../constants/Paths';
import styles from "../scss/Card.module.scss";

interface ICardProps{
    card:ICard;
};

function Card({card}:ICardProps){
    const handleCardClick = useCallback(() => {
        console.log('Card is clicked : ', card.cardId);
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();;
        };
    }, [card.cardId]);

    return (
        <div className={styles.wrapper}>
            <div className = {styles.card}>
                <div className = {styles.content} >
                    <Link to={Paths.CARDS.replace(':id', card.cardId)}
                        title={card.cardId}
                        className={styles.name}
                        onClick={handleCardClick}
                    >
                        <div className={styles.details}>
                            {card.cardName}
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Card;