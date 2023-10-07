import { useCallback, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { cardSelectorCardId } from '../atoms/atomsBoard';
import { atomCurrentCard, ICard } from '../atoms/atomCard';
import Label from './Label';
import CardTasks from './CardTasks';
import User from './User';
import DueDate from './DueDate';
import Stopwatch from './Stopwatch';
import classNames from 'classnames';
import styles from '../scss/Card.module.scss';

interface ICardProps {
  cardId: string;
}

function Card({ cardId }: ICardProps) {
  const [card, setCard] = useRecoilState(cardSelectorCardId(cardId));
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);

  const handleCardClick = useCallback(() => {
    if (card) {
      console.log('Card is clicked : ', card.cardId);
      setCurrentCard(card);
    }
  }, [setCurrentCard, card]);

  useEffect(() => {
    console.log("CardModal / useEffect : 1");
  }, []);

  const contentNode = card ? (
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
        {card.tasks.length > 0 && <CardTasks items={card.tasks} />}
        {(card.dueDate || card.stopwatch) && (
          <span className={styles.attachments}>
            {card.dueDate && (
              <span
                className={classNames(styles.attachment, styles.attachmentLeft)}
              >
                <DueDate value={new Date(card.dueDate)} size="tiny" />
              </span>
            )}
            {card.stopwatch && (
              <span
                className={classNames(styles.attachment, styles.attachmentLeft)}
              >
                <Stopwatch
                  as="span"
                  startedAt={card.stopwatch.startedAt}
                  total={card.stopwatch.total}
                  size="tiny"
                  //onClick={canEdit ? handleToggleStopwatchClick : undefined}
                />
              </span>
            )}
          </span>
        )}
        {card.memberships.length > 0 && (
          <span
            className={classNames(styles.attachments, styles.attachmentsRight)}
          >
            {card.memberships.map((user) => (
              <span
                key={user.cardMembershipId}
                className={classNames(
                  styles.attachment,
                  styles.attachmentRight
                )}
              >
                <User
                  userName={user.userName}
                  avatarUrl={user.avatarUrl}
                  size="small"
                />
              </span>
            ))}
          </span>
        )}
      </div>
    </>
  ) : null;

  return card ? (
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
  ) : null;
}

export default Card;
