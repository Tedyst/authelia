import React, { Component } from "react";

import styles from '../../assets/scss/components/AlreadyAuthenticated/AlreadyAuthenticated.module.scss';
import Button from "@material/react-button";
import CircleLoader, { Status } from "../CircleLoader/CircleLoader";

export interface OwnProps {
  username: string;
}

export interface DispatchProps {
  onLogoutClicked: () => void;
}

export type Props = OwnProps & DispatchProps;

class AlreadyAuthenticated extends Component<Props> {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.messageContainer}>
            <span className={styles.username}>{this.props.username}</span>
            you are authenticated
          </div>
          <div className={styles.statusIcon}><CircleLoader status={Status.SUCCESSFUL} /></div>
        </div>
        <div className={styles.logoutButtonContainer}>
          <Button
            onClick={this.props.onLogoutClicked}
            color="red">
            Logout
          </Button>
        </div>
      </div>
    )
  }
}

export default AlreadyAuthenticated;