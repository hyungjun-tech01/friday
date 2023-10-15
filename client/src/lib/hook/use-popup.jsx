import { ResizeObserver } from '@juggle/resize-observer';
import { cloneElement, useCallback, useMemo, useRef, useState } from 'react';
import { Button, Popup} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import styles from './Popup.module.css';

const usePopup = (Step, props) => {
  return useMemo(() => {
    const CustomPopup = ({ children, onClose=undefined, ...stepProps }) => {
      const [isOpened, setIsOpened] = useState(false);

      const wrapper = useRef(null);
      const resizeObserver = useRef(null);

      const handleOpen = useCallback(() => {
        setIsOpened(true);
      }, []);

      const handleClose = useCallback(() => {
        setIsOpened(false);

        if (onClose) {
          onClose();
        }
      }, [onClose]);

      const handleMouseDown = useCallback((event) => {
        event.stopPropagation();
      }, []);

      const handleClick = useCallback((event) => {
        event.stopPropagation();
      }, []);

      const handleTriggerClick = useCallback(
        (event) => {
          event.stopPropagation();

          if(children) {
            const { onClick } = children;

            if (onClick) {
              onClick(event);
            }
          }
        },
        [children]
      );

      const handleContentRef = useCallback((element) => {
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }

        if (!element) {
          resizeObserver.current = null;
          return;
        }

        resizeObserver.current = new ResizeObserver(() => {
          if (resizeObserver.current.isInitial) {
            resizeObserver.current.isInitial = false;
            return;
          }

          wrapper.current.positionUpdate();
        });

        resizeObserver.current.isInitial = true;
        resizeObserver.current.observe(element);
      }, []);

      const tigger = children ? cloneElement(children, {
        onClick: handleTriggerClick,
      }) : null;

      return (
        <Popup
          basic
          wide
          ref={wrapper}
          trigger={tigger}
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
          className={styles.wrapper}
          onOpen={handleOpen}
          onClose={handleClose}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          {...props} // eslint-disable-line react/jsx-props-no-spreading
        >
          <div ref={handleContentRef}>
            <Button
              icon="close"
              onClick={handleClose}
              className={styles.closeButton}
            />
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Step {...stepProps} onClose={handleClose} />
          </div>
        </Popup>
      );
    };

    CustomPopup.propTypes = {
      children: PropTypes.node,
      onClose: PropTypes.func,
    };

    CustomPopup.defaultProps = {
      children: undefined,
      onClose: undefined,
    };

    return CustomPopup;
  }, [props]);
};

export default usePopup;