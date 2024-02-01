import React, { useCallback, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'semantic-ui-react';
import { Draggable } from 'react-beautiful-dnd';

import { apiModifyCard } from '../../api/card';
import { cardSelectorCardId } from '../../atoms/atomsBoard';
import {
  atomCurrentCard,
  defaultModifyCard,
  ICard,
  IModifyCard,
} from '../../atoms/atomCard';
import { IStopwatch } from '../../atoms/atomStopwatch';
import { CardRepository } from '../../repository/cardRepo';
import NameEdit from '../NameEdit';
import Label from '../Label';
import CardTasks from './CardTasks';
import User from '../User';
import DueDate from '../DueDate';
import Stopwatch from '../Stopwatch';
import CardEditPopup from './CardEditPopup';

import { usePopup } from '../../lib/hook';
import { startStopwatch, stopStopwatch } from '../../utils/stopwatch';
import Paths from '../../constants/Paths';
import classNames from 'classnames';
import styles from './Card.module.scss';

interface ICardProps {
  index: number;
  card: ICard;
  canEdit: boolean;
  onDelete: (id: string) => void;
}

function Card({ index, card, canEdit, onDelete }: ICardProps) {
  const setCard = useSetRecoilState<ICard>(cardSelectorCardId(card.cardId));
  const setCurrentCard = useSetRecoilState<ICard>(atomCurrentCard);
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);

  const nameEdit = useRef<any>(null);
  const CardEdit = usePopup(CardEditPopup);

  const {
    updateCardName,
    updateCardStopwatch,
  } = useRecoilValue(CardRepository);

  const handleCardClick = useCallback(
    (event: any) => {
      if (event.target.parentElement) {
        const parentName = event.target.parentElement.className;
        if (
          parentName.includes('CardTasks_progressWrapper') ||
          parentName.includes('CardTasks_button') ||
          parentName.includes('Stopwatch_button')
        ) {
          return;
        }
      }
      if (card) {
        setCurrentCard(card);
      }
    },
    [setCurrentCard, card]
  );

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const handleNameUpdate = useCallback(
    (data: string) => {
      updateCardName(card.cardId, cookies.UserId, data);
    },
    [card]
  );

  const handleStopwatchUpdate = useCallback(
    (stopwatch: IStopwatch | null) => {
      updateCardStopwatch(card.cardId, cookies.UserId, stopwatch);
    },
    [card]
  );

  const handleToggleStopwatchClick = useCallback(() => {
    if (card.stopwatch?.startedAt) {
      handleStopwatchUpdate(stopStopwatch(card.stopwatch));
    } else {
      handleStopwatchUpdate(startStopwatch(card.stopwatch));
    }
  }, [card, handleStopwatchUpdate]);

  const handleCardDelete = useCallback(() => {
    onDelete(card.cardId);
  }, [onDelete, card]);

  const contentNode = (
    <div className={styles.details}>
      {card && card.labels && card.labels.length > 0 && (
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
                onClick={canEdit ? handleToggleStopwatchClick : undefined}
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
    <Draggable
      draggableId={`card:${card.cardId}`}
      index={index}
      isDragDisabled={!canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps}
          {...dragHandleProps}
          ref={innerRef}
          className={styles.wrapper}
        >
          <NameEdit
            ref={nameEdit}
            defaultValue={card.cardName}
            onUpdate={handleNameUpdate}
          >
            <div className={styles.card}>
              <Link
                to={Paths.CARDS.replace(':id', card.cardId)}
                className={styles.content}
                onClick={handleCardClick}
              >
                {contentNode}
              </Link>
              {canEdit && (
                <CardEdit
                  cardId={card.cardId}
                  onNameEdit={handleNameEdit}
                  onDelete={handleCardDelete}
                >
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
      )}
    </Draggable>
  );
}

export default Card;
