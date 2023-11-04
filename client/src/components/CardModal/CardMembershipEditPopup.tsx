import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Menu, Popup } from 'semantic-ui-react';
import { IBoardUser } from '../../atoms/atomsBoard';
import CardMembershipItem from './CardMembershipItem';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import styles from './CardMembershipEditPopup.module.scss';

interface ICardMembershipEditProps {
  items: IBoardUser[];
  currentUserIds: string[];
  title?: string;
  onUserSelect: (id: string) => void;
  onUserDeselect: (id: string) => void;
  onBack?: () => void;
}

const CardMembershipEditPopup = ({
  items,
  currentUserIds,
  title = 'common.members',
  onUserSelect,
  onUserDeselect,
  onBack,
}: ICardMembershipEditProps) => {
  const [t] = useTranslation();

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

  return (
    <>
      <CustomPopupHeader onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </CustomPopupHeader>
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
              <CardMembershipItem
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
};

export default CardMembershipEditPopup;
