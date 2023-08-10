import {ICard} from "../atoms/atomCard";
import styles from "../scss/Card.module.scss";

interface ICardProps{
    card:ICard;
}
function Card({card}:ICardProps){
    return (
        <div className={styles.wrapper}>
            <div className = {styles.card}>
                <div className = {styles.content} >
                    <div className={styles.details}>
                        <div className={styles.name}>{card.cardName}</div>
                    </div>    
                </div>
            </div>
        </div>
    );

}

export default Card;