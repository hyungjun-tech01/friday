import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactElement,
  cloneElement,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Menu, Popup, Button } from 'semantic-ui-react';
import { IBoardUser } from '../atoms/atomsBoard';
import styles from '../scss/CardMembershipPopup.module.scss';

interface ICardMembershipProps {
  children: ReactElement;
  items: IBoardUser[];
  currentUserIds: string[];
  title?: string;
  onUserSelect: (id: string) => void;
  onUserDeselect: (id: string) => void;
}

const CardMembershipPopup = ({
  children,
  items,
  currentUserIds,
  title = 'common.members',
  onUserSelect,
  onUserDeselect,
}: ICardMembershipProps) => {
  // Popup Control Part ---------------------
  const [t] = useTranslation();
  const popupRef = useRef<any>(null);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleTriggerClick = useCallback(() => {
    console.log('Popup / handleTriggerClick - ');
    setIsOpened(!isOpened);
  }, [isOpened]);

  const trigger = cloneElement(children as ReactElement<any>, {
    onClick: handleTriggerClick,
  });

  // Card Membership Part ---------------------
  const [search, setSearch] = useState('');
  const searchField = useRef<any>(null);
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const filteredItems = useMemo(
    () =>
      items.filter(
        (user) =>
          user.userEmail.includes(cleanSearch) ||
          user.userName.toLowerCase().includes(cleanSearch) ||
          (user.userName && user.userName.includes(cleanSearch))
      ),
    [items, cleanSearch]
  );

  const handleUserSelect = useCallback(
    (id: string) => {
      onUserSelect(id);
    },
    [onUserSelect]
  );

  const handleUserDeselect = useCallback(
    (id: string) => {
      onUserDeselect(id);
    },
    [onUserDeselect]
  );

  const handleSearchChange = useCallback((event: any) => {
    setSearch(event.target.value);
  }, []);

  useEffect(() => {
    if (searchField.current) {
      searchField.current.focus({
        preventScroll: true,
      });
    }
  }, []);

  const contents = (
    <>
      <Popup.Header className={styles.popupHeader}>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={searchField}
          value={search}
          placeholder={t('common.searchMembers')}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredItems.length > 0 && (
          <Menu secondary vertical className={styles.menu}>
            {filteredItems.map((user) => (
              <Menu.Item
                key={user.userId}
                //isPersisted={item.isPersisted}
                isActive={currentUserIds.includes(user.userId)}
                user={user}
                onUserSelect={() => handleUserSelect(user.userId)}
                onUserDeselect={() => handleUserDeselect(user.userId)}
              />
            ))}
          </Menu>
        )}
      </Popup.Content>
    </>
  );

  return (
    <Popup
      basic
      wide
      ref={popupRef}
      trigger={trigger}
      on="click"
      open={isOpened}
      position="bottom left"
      popperModifiers={[
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            padding: 20,
          },
        },
      ]}
      className={styles.popupWrapper}
      onOpen={handleOpen}
      onClose={handleClose}
    >
      <div>
        {/* <div ref={handleContentRef}> */}
        <Button
          icon="close"
          onClick={handleClose}
          className={styles.popupCloseButton}
        />
        {contents}
      </div>
    </Popup>
  );
};

export default CardMembershipPopup;
