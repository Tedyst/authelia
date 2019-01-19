import { createAction } from 'typesafe-actions';
import {
  FETCH_STATE_REQUEST,
  FETCH_STATE_SUCCESS,
  FETCH_STATE_FAILURE,
  SET_REDIRECTION_URL,
} from "../../constants";
import RemoteState from '../../../views/AuthenticationView/RemoteState';

/*     FETCH_STATE    */
export const fetchState = createAction(FETCH_STATE_REQUEST);
export const fetchStateSuccess = createAction(FETCH_STATE_SUCCESS, resolve => {
  return (state: RemoteState) => {
    return resolve(state);
  }
});
export const fetchStateFailure = createAction(FETCH_STATE_FAILURE, resolve => {
  return (err: string) => {
    return resolve(err);
  }
});

export const setRedirectionUrl = createAction(SET_REDIRECTION_URL, resolve => {
  return (url: string) => resolve(url);
})