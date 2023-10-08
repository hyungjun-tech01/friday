import { useCallback, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Label } from 'semantic-ui-react';
//import { usePopup } from '../../../lib/popup';

//import EditStep from './EditStep';

import styles from '../scss/AttachmentItem.module.scss';

interface IAttachmentItemProps {
  name: string;
  url?: string;
  coverUrl?: string;
  createdAt?: Date;
  isCover: boolean;
  //isPersisted: boolean;
  canEdit: boolean;
  onClick?: () => void;
  onCoverSelect: () => void;
  onCoverDeselect: () => void;
  onUpdate: (data:any) => void;
  onDelete: () => void;
}

const AttachmentItem = forwardRef(
  (
    {
      name,
      url,
      coverUrl,
      createdAt,
      isCover,
      //isPersisted,
      canEdit,
      onCoverSelect,
      onCoverDeselect,
      onClick,
      onUpdate,
      onDelete,
    }: IAttachmentItemProps,
    ref : any
  ) => {
    const [t] = useTranslation();

    const handleClick = useCallback(() => {
      if (onClick) {
        onClick();
      } else {
        window.open(url, '_blank');
      }
    }, [url, onClick]);

    const handleToggleCoverClick = useCallback(
      (event: any) => {
        event.stopPropagation();

        if (isCover) {
          onCoverDeselect();
        } else {
          onCoverSelect();
        }
      },
      [isCover, onCoverSelect, onCoverDeselect]
    );

    //const EditPopup = usePopup(EditStep);

    // if (!isPersisted) {
    //   return (
    //     <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>
    //       <Loader inverted />
    //     </div>
    //   );
    // }
    // const filename = url ? url.split('/').pop() : "";
    // const extension = filename ? filename.slice(
    //   (Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1
    // ) : "";
    const extension = name ? name.slice(
      (Math.max(0, name.lastIndexOf('.')) || Infinity) + 1
    ) : "";

    return (
      <div ref={ref} className={styles.wrapper} onClick={handleClick}>
        <div
          className={styles.thumbnail}
          style={{
            background: coverUrl && `url("${coverUrl}") center / cover`,
          }}
        >
          {coverUrl ? (
            isCover && (
              <Label
                corner="left"
                size="mini"
                icon={{
                  name: 'star',
                  color: 'grey',
                  inverted: true,
                }}
                className={styles.thumbnailLabel}
              />
            )
          ) : (
            <span className={styles.extension}>{extension || '-'}</span>
          )}
        </div>
        <div className={styles.details}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date}>
            {t('format:longDateTime', {
              postProcess: 'formatDate',
              value: createdAt,
            })}
          </span>
          {coverUrl && canEdit && (
            <span className={styles.options}>
              <button
                type="button"
                className={styles.option}
                onClick={handleToggleCoverClick}
              >
                <Icon
                  name="window maximize outline"
                  flipped="vertically"
                  size="small"
                  className={styles.optionIcon}
                />
                <span className={styles.optionText}>
                  {isCover
                    ? t('action.removeCover', {
                        context: 'title',
                      })
                    : t('action.makeCover', {
                        context: 'title',
                      })}
                </span>
              </button>
            </span>
          )}
        </div>
        {/* {canEdit && (
          <EditPopup
            defaultData={{
              name,
            }}
            onUpdate={onUpdate}
            onDelete={onDelete}
          >
            <Button className={classNames(styles.button, styles.target)}>
              <Icon fitted name="pencil" size="small" />
            </Button>
          </EditPopup>
        )} */}
      </div>
    );
  }
);

export default AttachmentItem;
