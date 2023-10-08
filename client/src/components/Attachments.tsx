import { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Gallery, Item as GalleryItem } from 'react-photoswipe-gallery';
import { Button } from 'semantic-ui-react';
import { IAttachment } from '../atoms/atomCard';
import AttachmentItem from './AttachmentItem';
//import Item from './Item';

import styles from '../scss/Attachments.module.scss';

const INITIALLY_VISIBLE = 4;

interface IAttachementsProps {
  items: IAttachment[]; // eslint-disable-line react/forbid-prop-types
  canEdit: boolean;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onCoverUpdate: (id: string | null) => void;
  onGalleryOpen: () => void;
  onGalleryClose: () => void;
}

const Attachments = ({
  items,
  canEdit,
  onUpdate,
  onDelete,
  onCoverUpdate,
  onGalleryOpen,
  onGalleryClose,
}: IAttachementsProps) => {
  const [t] = useTranslation();
  const [isAllVisible, setIsAllVisible] = useState<boolean>(false);

  const handleCoverSelect = useCallback(
    (id: string) => {
      onCoverUpdate(id);
    },
    [onCoverUpdate]
  );

  const handleCoverDeselect = useCallback(() => {
    onCoverUpdate(null);
  }, [onCoverUpdate]);

  const handleUpdate = useCallback(
    (id: string, data: any) => {
      onUpdate(id, data);
    },
    [onUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const handleBeforeGalleryOpen = useCallback(
    (gallery: any) => {
      onGalleryOpen();

      gallery.on('destroy', () => {
        onGalleryClose();
      });
    },
    [onGalleryOpen, onGalleryClose]
  );

  const handleToggleAllVisibleClick = useCallback(() => {
    setIsAllVisible(!isAllVisible);
  }, [isAllVisible]);

  const galleryItemsNode = items.map((item, index) => {
    //const isPdf = item.url && item.url.endsWith('.pdf');
    const isPdf = item.fileName && item.fileName.endsWith('.pdf');

    let props;
    if (item.image) {
      props = item.image;
    } else {
      props = {
        content: isPdf ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <object
            data={item.url}
            type="application/pdf"
            className={classNames(styles.content, styles.contentPdf)}
          />
        ) : (
          <span className={classNames(styles.content, styles.contentError)}>
            {t('common.thereIsNoPreviewAvailableForThisAttachment')}
          </span>
        ),
      };
    }

    const isVisible = isAllVisible || index < INITIALLY_VISIBLE;

    return (
      <GalleryItem
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        key={item.cardAttachementId}
        original={item.url}
        caption={item.cardAttachmentName}
      >
        {({ ref, open }) =>
          isVisible ? (
            <AttachmentItem
              ref={ref}
              name={item.cardAttachmentName}
              url={item.url}
              coverUrl={item.coverUrl}
              createdAt={new Date(item.createdAt)}
              isCover={item.isCover}
              //isPersisted={item.isPersisted}
              canEdit={canEdit}
              onClick={item.image || isPdf ? () => open : undefined}
              onCoverSelect={() => handleCoverSelect(item.cardAttachementId)}
              onCoverDeselect={handleCoverDeselect}
              onUpdate={(data: any) =>
                handleUpdate(item.cardAttachementId, data)
              }
              onDelete={() => handleDelete(item.cardAttachementId)}
            />
          ) : (
            <span ref={ref} />
          )
        }
      </GalleryItem>
    );
  });

  return (
    <>
      <Gallery
        withCaption
        withDownloadButton
        options={{
          wheelToZoom: true,
          showHideAnimationType: 'none',
          closeTitle: '',
          zoomTitle: '',
          arrowPrevTitle: '',
          arrowNextTitle: '',
          errorMsg: '',
        }}
        onBeforeOpen={handleBeforeGalleryOpen}
      >
        {galleryItemsNode}
      </Gallery>
      {items.length > INITIALLY_VISIBLE && (
        <Button
          fluid
          content={
            isAllVisible
              ? t('action.showFewerAttachments')
              : t('action.showAllAttachments', {
                  hidden: items.length - INITIALLY_VISIBLE,
                })
          }
          className={styles.toggleButton}
          onClick={handleToggleAllVisibleClick}
        />
      )}
    </>
  );
};

export default Attachments;
