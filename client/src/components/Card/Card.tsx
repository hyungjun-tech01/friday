import { useCallback, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'semantic-ui-react';
import { cardDeleter, cardSelectorCardId } from '../../atoms/atomsBoard';
import { atomCurrentCard, defaultModifyCard, ICard, IModifyCard } from '../../atoms/atomCard';
import NameEdit from '../NameEdit';
import Label from '../Label';
import CardTasks from '../CardTasks';
import User from '../User';
import DueDate from '../DueDate';
import Stopwatch from '../Stopwatch';
import CardEditPopup from './CardEditPopup';
import { apiModifyCard } from '../../api/card';
import { usePopup } from '../../lib/hook';
import Paths from '../../constants/Paths';
import classNames from 'classnames';
import styles from './Card.module.scss';

interface ICardProps {
  cardId: string,
  canEdit: boolean,
};

function Card({ cardId, canEdit }: ICardProps) {
  const [card, setCard] = useRecoilState(cardSelectorCardId(cardId));
  const deleteCard = useSetRecoilState(cardDeleter(cardId));
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);

  const nameEdit = useRef<any>(null);
  const CardEdit = usePopup(CardEditPopup);

  const handleCardClick = useCallback(
    (event: any) => {
      if (event.target.parentElement) {
        const parentName = event.target.parentElement.className;
        if (
          parentName.includes('CardTasks_progressWrapper') ||
          parentName.includes('CardTasks_button')
        ) {
          return;
        }
      }
      if (card) {
        console.log('Card is clicked : ', card.cardId);
        setCurrentCard(card);
      }
    },
    [setCurrentCard, card]
  );

  const handleNameEdit = useCallback(() => {
    console.log('Card - handleNameEdit');
    nameEdit.current.open();
  }, []);

  const handleNameUpdate = useCallback((data: string) => {
    console.log('Udate name of card : ', data);
    const modifiedCard: IModifyCard = {
      ...defaultModifyCard,
      cardId: card.cardId,
      userId: cookies.UserId,
      cardName: data,
      cardActionType: 'UPDATE',
    };

    const response = apiModifyCard(modifiedCard);
    response
      .then((result) => {
        if (result.message) {
          console.log('Fail to update name of card', result.message);
        } else {
          console.log('Succeed to update name of card', result);
          const updatedCard = {
            ...card,
            cardName: data,
          };
          setCard(updatedCard);
        }
      })
      .catch((message) => {
        console.log('Fail to update name of card', message);
      });
  },
  [card, cookies, setCard]);

  const handleCardDelete = useCallback(() => {
      console.log('delete card : ', cardId);
      const updateCard: IModifyCard = {
        ...defaultModifyCard,
        cardId: cardId,
        userId: cookies.UserId,
        cardActionType: 'DELETE',
      };
      const response = apiModifyCard(updateCard);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to delete card', result.message);
          } else {
            console.log('Succeed to delete card', result);
            deleteCard(card);
          };
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });  
  }, [card, cardId, cookies.UserId, deleteCard]);

  const contentNode = (
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
              className={classNames(styles.attachment, styles.attachmentRight)}
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
  );

  return (
    <div className={styles.wrapper}>
      <NameEdit
        ref={nameEdit}
        defaultValue={card.cardName}
        onUpdate={handleNameUpdate}
      >
        <div className={styles.card}>
          <Link
            to={Paths.CARDS.replace(':id', cardId)}
            className={styles.content}
            onClick={handleCardClick}
          >
            {contentNode}
          </Link>
          {canEdit && (
            <CardEdit card={card} setCard={setCard} onNameEdit={handleNameEdit} onDelete={handleCardDelete}>
              <Button
                className={classNames(styles.actionsButton, styles.target)}
              >
                <Icon fitted name="pencil" size="small" />
              </Button>
            </CardEdit>
          )}
        </div>
      </NameEdit>
    </div>
  );
}

export default Card;