import React, { Component } from "react";
import classnames from 'classnames';

import mail from '../../assets/images/mail.png';

import styles from './ConfirmationSentView.module.css';
import { Button } from "@material-ui/core";
import { RouterProps } from "react-router";

interface Props extends RouterProps {}

export default class ConfirmationSent extends Component<Props> {
  render() {
    return (
      <div className={styles.main}>
        <div className={classnames(styles.image, styles.left)}>
          <img src={mail} alt="mail" />
        </div>
        <div className={styles.right}>
          Please check your e-mails and follow the instructions to confirm the operation.
          <div className={styles.buttonContainer}>
              <Button
                onClick={() => this.props.history.push('/')}
                className={styles.button}
                variant="contained"
                color="primary">
                Back to login
              </Button>
            </div>
        </div>
      </div>
    )
  }
}