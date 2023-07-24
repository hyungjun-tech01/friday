import React from "react";
import styles from "../scss/Board.module.scss";
import { Form, Grid, Header, Message } from 'semantic-ui-react';


function Login(){
    return (
        <div className={`${styles.wrapper} ${styles.fullHeight}`}>
          <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
            <Grid.Column widescreen={4} largeScreen={5} computer={6} tablet={16} mobile={16}>
              <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
                <Grid.Column>
                  <div className={styles.loginWrapper}>
                    <Header
                      as="h1"
                      textAlign="center"
                      content={`Login`}
                      className={styles.formTitle}
                    />
                    <div>
                      {message && (
                        <Message
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...{
                            [message.type]: true,
                          }}
                          visible
                          content={t(message.content)}
                          onDismiss={onMessageDismiss}
                        />
                      )}
                      <Form size="large" onSubmit={handleSubmit}>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
                          <Input
                            fluid
                            ref={emailOrUsernameField}
                            name="emailOrUsername"
                            value={data.emailOrUsername}
                            readOnly={isSubmitting}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.password')}</div>
                          <Input.Password
                            fluid
                            ref={passwordField}
                            name="password"
                            value={data.password}
                            readOnly={isSubmitting}
                            className={styles.input}
                            onChange={handleFieldChange}
                          />
                        </div>
                        <div className={styles.buttonWrapper}>
                          <Form.Button
                            primary
                            size="large"
                            icon="right arrow"
                            labelPosition="right"
                            content={t('action.logIn')}
                            floated="right"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                          />
                        </div>
                      </Form>
                    </div>
                  </div>
                </Grid.Column>
              </Grid>
            </Grid.Column>
            <Grid.Column
              widescreen={12}
              largeScreen={11}
              computer={10}
              only="computer"
              className={classNames(styles.cover, styles.fullHeight)}
            >
              <div className={styles.descriptionWrapperOverlay} />
              <div className={styles.descriptionWrapper}>
                <Header inverted as="h1" content="Planka" className={styles.descriptionTitle} />
                <Header
                  inverted
                  as="h2"
                  content={t('common.projectManagement')}
                  className={styles.descriptionSubtitle}
                />
              </div>
            </Grid.Column>
          </Grid>
        </div>
      );
}
export default Login;