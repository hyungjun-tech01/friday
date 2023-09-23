import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { ICard, atomCurrentCard } from '../atoms/atomCard';
import Label from './Label';
import classNames from 'classnames';
import styles from '../scss/Card.module.scss';

interface ICardProps {
  card: ICard;
}

function Card({ card }: ICardProps) {
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
  const handleCardClick = useCallback(() => {
    console.log('Card is clicked : ', card.cardId);
    // if (document.activeElement) {
    //     (document.activeElement as HTMLElement).blur();;
    // };
    if (card) setCurrentCard(card);
  }, [card, setCurrentCard]);

  const contentNode = (
    <>
      <div className={styles.details}>
        {card.labels.length > 0 && (
          <span className={styles.labels}>
            {card.labels.map((label) => (
              <span
                key={label.labelId}
                className={classNames(styles.attachment, styles.attachmentLeft)}
              >
                <Label name={label.labelName} color={label.color} size="tiny" />
              </span>
            ))}
          </span>
        )}
        <div className={styles.name}>{card.cardName}</div>
      </div>
    </>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div
            title={card.cardId}
            className={styles.name}
            onClick={handleCardClick}
          >
            {contentNode}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
