import React, { useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { Button, Popup } from "semantic-ui-react";
import { truncate } from "lodash";
import User from "./User";
import CustomPopupHeader from "../lib/ui/CustomPopupHeader";
import Paths from '../constants/Paths';
import ActivityTypes from "../constants/ActivityTypes";
import styles from "../scss/NotiModal.module.scss";
import { INotification } from "../atoms/atomNotification";

// notimodal props interface 정의 
interface INotiModalProps{
    items: INotification[],
    onDelete: (id:string) => void,
    onClose: () => void;
}

const NotiModal = ({ items, onDelete, onClose }:INotiModalProps) => {
    const [t] = useTranslation();
    const [cookie, setCookie] = useCookies();

    const handleDelete = useCallback((id: string) => {
        onDelete(id);
    }, [onDelete]);

    const renderItemContent = useCallback(
    ({ activity, card, user }:INotification) => {
        switch (activity.type) {
        case ActivityTypes.MOVE_CARD:
        case ActivityTypes.CARD_MOVE:
            return (
            <Trans
                i18nKey="common.userMovedCardFromListToList"
                values={{
                user: user.name,
                card: card.name,
                fromList: activity.data.fromList.name,
                toList: activity.data.toList.name,
                }}
            >
                {user.name}
                {' moved '}
                <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
                </Link>
                {' from '}
                {activity.data.fromList.name}
                {' to '}
                {activity.data.toList.name}
            </Trans>
            );
        case ActivityTypes.COMMENT_CARD:
        case ActivityTypes.CARD_COMMENT_ADD:
        {
            const commentText = truncate(activity.data.text);

            return (
            <Trans
                i18nKey="common.userLeftNewCommentToCard"
                values={{
                user: user.name,
                comment: commentText,
                card: card.name,
                }}
            >
                {user.name}
                {` left a new comment «${commentText}» to `}
                <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
                </Link>
            </Trans>
            );
        }
        case ActivityTypes.CARD_COMMENT_UPDATE:
        {
            const commentText = truncate(activity.data.text);

            return (
            <Trans
                i18nKey="common.userUpdateThisCommentInCard"
                values={{
                user: user.name,
                comment: commentText,
                card: card.name,
                }}
            >
                {user.name}
                {` update a comment «${commentText}» to `}
                <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
                </Link>
            </Trans>
            );
        }
        case ActivityTypes.CARD_COMMENT_DELETE:
        {
            return (
            <Trans
                i18nKey="common.userDeleteThisCommentInCard"
                values={{
                user: user.name,
                card: card.name,
                }}
            >
                {user.name}
                <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
                </Link>
            </Trans>
            );
        }
        default:
        }

        return null;
    },
    [onClose],
    );

    return (
        <>
            <CustomPopupHeader>
                {t('common.notifications', {
                context: 'title',
                })}
            </CustomPopupHeader>
            <Popup.Content>
                {items.length > 0 ? (
                <div className={styles.wrapper}>
                    {items.map((item: INotification) => (
                    <div key={item.notiId} className={styles.item}>
                        {item.card && item.activity ? (
                        <>
                            <User
                                userName={item.user.name}
                                avatarUrl={item.user.avatarUrl}
                                size="large"
                            />
                            <span className={styles.itemContent}>{renderItemContent(item)}</span>
                        </>
                        ) : (
                        <div className={styles.itemDeleted}>{t('common.cardOrActionAreDeleted')}</div>
                        )}
                        <Button
                        type="button"
                        icon="trash alternate outline"
                        className={styles.itemButton}
                        onClick={() => handleDelete(item.notiId)}
                        />
                    </div>
                    ))}
                </div>
                ) : (
                t('common.noUnreadNotifications')
                )}
            </Popup.Content>
        </>
    );
}

export default NotiModal;