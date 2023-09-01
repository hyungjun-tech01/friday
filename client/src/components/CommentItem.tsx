import { Comment } from 'semantic-ui-react';
//import { useTranslation } from 'react-i18next';
// import classNames from 'classnames';
// import styles from '../scss/CommentItem.module.scss';

interface ICommentItemProps {
  userName: string;
  createdAt: string;
  updatedAt: string;
  data: {text:string};
}

const CommentItem = ({userName, createdAt, updatedAt, data}:ICommentItemProps) => {
    //const [t] = useTranslation();

    return (
        <Comment>
          <Comment.Author as='a'>{userName}</Comment.Author>
            <Comment.Metadata>
              <div>{updatedAt ? updatedAt : createdAt}</div>
            </Comment.Metadata>
            <Comment.Text>{data.text}</Comment.Text>
            <Comment.Actions>
              <Comment.Action>Reply</Comment.Action>
            </Comment.Actions>
        </Comment>
      );
};

export default CommentItem;