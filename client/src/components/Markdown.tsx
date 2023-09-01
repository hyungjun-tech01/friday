import { useCallback, ReactNode, ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import '../scss/Markdown.module.scss'; // FIXME: import as styles?


interface IMarkdownProps extends ReactMarkdownOptions {
  children: string;
  linkStopPropagation: boolean;
};

const ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i;

const Markdown = ({linkStopPropagation, ...props}:IMarkdownProps) => {
  const handleLinkClick = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const linkRenderer = useCallback(
    ({ ...linkProps }) => (
      /* eslint-disable-next-line jsx-a11y/anchor-has-content,
                                  jsx-a11y/click-events-have-key-events,
                                  jsx-a11y/no-static-element-interactions */
      <a
        {...linkProps} // eslint-disable-line react/jsx-props-no-spreading
        rel={
          ABSOLUTE_URL_REGEX.test(linkProps.href) && linkProps.target === '_blank'
            ? 'noreferrer'
            : undefined
        }
        onClick={linkStopPropagation ? handleLinkClick : undefined}
      />
    ),
    [linkStopPropagation, handleLinkClick],
  );

  return (
    <ReactMarkdown
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      components={{
        a: linkRenderer,
      }}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      className="markdown-body"
    />
  );
};

export default Markdown;
