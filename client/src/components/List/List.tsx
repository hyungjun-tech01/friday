import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactComponent as PlusMathIcon } from '../../image/plus-math-icon.svg';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCookies } from 'react-cookie';
import { Button, Icon } from 'semantic-ui-react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import styles from './List.module.scss';
import { ICard, IModifyCard, defaultModifyCard } from '../../atoms/atomCard';
import { IModifyList, defaultModifyList } from '../../atoms/atomsList';
import Card from '../Card/Card';
import CardAdd from '../Card/CardAdd';
import {
  listSelector,
  listDeleter,
  cardsSelector,
} from '../../atoms/atomsBoard';
import NameEdit from './NameEdit';
import { apiModifyCard } from '../../api/card';
import { apiModifyList } from '../../api/list';
import { usePopup } from '../../lib/hook';
import ActionsStep from './ActionsStep';

interface IListProps {
  id: string;
  index: number;
  position: number;
  name: string;
  canEdit: boolean;
}
function List({ id, index, position, name, canEdit }: IListProps) {
  const list = useRecoilValue(listSelector(id));
  const setList = useSetRecoilState(listSelector(id));
  const deleteList = useSetRecoilState(listDeleter(id));
  const [t] = useTranslation();
  const [cookies] = useCookies(['UserId', 'UserName', 'AuthToken']);
  //const selectCards = useRecoilValue(cardsbyListIdSelector); // 호출 가능한 함수를 가져옴
  const [currentCards, setCurrentCards] = useRecoilState(cardsSelector);

  const [isCardLoading, setIsCardLoading] = useState(true);
  const [cards, setCards] = useState<ICard[]>([]);
  const [isCardAddOpened, setIsCardAddOpened] = useState(false);
  const [isCardRequery, setIsCardRequery] = useState(false);
  const nameEdit = useRef<any>(null);
  const ActionsPopup = usePopup(ActionsStep);

  useEffect(() => {
    setIsCardLoading(true);
    //onQueryCards();
    const updatedCards = currentCards.filter((card) => card.listId === id);
    setCards(updatedCards);
    setIsCardLoading(false);
  }, [id, isCardRequery, currentCards]);

  const handleAddCardClick = () => {
    console.log('addcard');
    setIsCardAddOpened(true);
  };

  const handleHeaderClick = useCallback(() => {
    if (canEdit) {
      if (nameEdit.current) nameEdit.current.open();
    }
  }, [canEdit]);

  const handleNameUpdate = useCallback(
    (data: string) => {
      console.log('Update name of list : ', data);
      const modifiedList: IModifyList = {
        ...defaultModifyList,
        listId: list.listId,
        userId: cookies.UserId,
        listName: data,
        listActionType: 'UPDATE',
      };

      const response = apiModifyList(modifiedList);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to update name of card', result.message);
          } else {
            console.log('Succeed to update name of card', result);
            const updatedList = {
              ...list,
              listName: data,
            };
            setList(updatedList);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
    },
    [list, cookies, setList]
  );
  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const handleListDelete = useCallback(
    (data: string) => {
      console.log('delete list : ', data);
      const modifiedList: IModifyList = {
        ...defaultModifyList,
        listId: list.listId,
        userId: cookies.UserId,
        listActionType: 'DELETE',
      };
      const response = apiModifyList(modifiedList);
      response
        .then((result) => {
          if (result.message) {
            console.log('Fail to delete list', result.message);
          } else {
            console.log('Succeed to delete list', result);
            deleteList(list);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
      console.log('delete');
    },
    [list, cookies, deleteList]
  );

  const handleCardAdd = useCallback(() => {
    console.log('card add');
    handleAddCardClick();
  }, []);

  const handleCardDelete = useCallback(
    (cardId: string) => {
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
            setIsCardLoading(true);

            const updatedCurrentCards = currentCards.filter(
              (card) => card.cardId !== cardId
            );
            setCurrentCards(updatedCurrentCards);
          }
        })
        .catch((message) => {
          console.log('Fail to update name of card', message);
        });
    },
    [cookies.UserId, currentCards, setCurrentCards]
  );

  const cardNode = (
    <Droppable droppableId={`list:${id}`} type="card" isDropDisabled={false}>
      {({ innerRef, droppableProps, placeholder }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...droppableProps} ref={innerRef}>
          <div className={styles.cards}>
            {!isCardLoading &&
              cards &&
              cards.map((card, index) => (
                <Card
                  key={card.cardId}
                  index={index}
                  card={card}
                  canEdit={card.creatorUserId === cookies.UserId ? true:canEdit}
                  onDelete={handleCardDelete}
                />
            ))}
            {placeholder}
            {isCardAddOpened && (
              <CardAdd
                listId={id}
                setIsCardAddOpened={setIsCardAddOpened}
                isCardRequery={isCardRequery}
                setIsCardRequery={setIsCardRequery}
              />
            )}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <Draggable
      draggableId={`list:${id}`}
      index={index}
      isDragDisabled={!canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps}
          data-drag-scroller
          ref={innerRef}
          className={styles.innerWrapper}
        >
          <div {...dragHandleProps} className={styles.outerWrapper}>
            <div className={styles.header}>
              {canEdit ? (
                <div className={styles.headerName} onClick={handleHeaderClick}>
                  <NameEdit
                    ref={nameEdit}
                    defaultValue={list.listName}
                    size="Small"
                    onUpdate={handleNameUpdate}
                  >
                    <div className={styles.headerName}>{name}</div>
                  </NameEdit>
                  <ActionsPopup
                    onNameEdit={handleNameEdit}
                    onCardAdd={handleCardAdd}
                    onDelete={handleListDelete}
                  >
                    <Button
                      className={classNames(styles.headerButton, styles.target)}
                    >
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </ActionsPopup>
                </div>
              ) : (
                <div className={styles.headerName}>{list.listName}</div>
              )}
            </div>
            <div
              className={`${styles.cardsInnerWrapper} ${styles.cardsInnerWrapperFull}`}
            >
              <div className={styles.cardsOuterWrapper}>{cardNode}</div>
              {!isCardAddOpened && (
                <button
                  type="button"
                  className={styles.addCardButton}
                  onClick={handleAddCardClick}
                >
                  <PlusMathIcon className={styles.addCardButtonIcon} />
                  <span className={styles.addCardButtonText}>
                    {cards && t('action.addAnotherCard')}
                    {!cards && t('action.addCard')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
export default List;
