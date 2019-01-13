import objectPath = require("object-path");
import randomstring = require("randomstring");
import BluebirdPromise = require("bluebird");
import util = require("util");
import Exceptions = require("./Exceptions");
import { IUserDataStore } from "./storage/IUserDataStore";
import Express = require("express");
import ErrorReplies = require("./ErrorReplies");
import { AuthenticationSessionHandler } from "./AuthenticationSessionHandler";
import { AuthenticationSession } from "../../types/AuthenticationSession";
import { ServerVariables } from "./ServerVariables";
import { IdentityValidable } from "./IdentityValidable";

import Identity = require("../../types/Identity");
import { IdentityValidationDocument }
  from "./storage/IdentityValidationDocument";
import { OPERATION_FAILED } from "../../../shared/UserMessages";

function createAndSaveToken(userid: string, challenge: string,
  userDataStore: IUserDataStore): BluebirdPromise<string> {

  const five_minutes = 4 * 60 * 1000;
  const token = randomstring.generate({ length: 64 });

  return userDataStore.produceIdentityValidationToken(userid, token, challenge,
    five_minutes)
    .then(function () {
      return BluebirdPromise.resolve(token);
    });
}

function consumeToken(token: string, challenge: string,
  userDataStore: IUserDataStore)
  : BluebirdPromise<IdentityValidationDocument> {
  return userDataStore.consumeIdentityValidationToken(token, challenge);
}

export function register(app: Express.Application,
  pre_validation_endpoint: string,
  post_validation_endpoint: string,
  handler: IdentityValidable,
  vars: ServerVariables) {

  app.post(pre_validation_endpoint,
    get_start_validation(handler, post_validation_endpoint, vars));
  app.post(post_validation_endpoint,
    get_finish_validation(handler, vars));
}

function checkIdentityToken(req: Express.Request, identityToken: string)
  : BluebirdPromise<void> {
  if (!identityToken)
    return BluebirdPromise.reject(
      new Exceptions.AccessDeniedError("No identity token provided"));
  return BluebirdPromise.resolve();
}

export function get_finish_validation(handler: IdentityValidable,
  vars: ServerVariables)
  : Express.RequestHandler {

  return function (req: Express.Request, res: Express.Response)
    : BluebirdPromise<void> {

    let authSession: AuthenticationSession;
    const identityToken = objectPath.get<Express.Request, string>(
      req, "query.token");
    vars.logger.debug(req, "Identity token provided is %s", identityToken);

    return checkIdentityToken(req, identityToken)
      .then(() => {
        authSession = AuthenticationSessionHandler.get(req, vars.logger);
        return handler.postValidationInit(req);
      })
      .then(() => {
        return consumeToken(identityToken, handler.challenge(),
          vars.userDataStore);
      })
      .then((doc: IdentityValidationDocument) => {
        authSession.identity_check = {
          challenge: handler.challenge(),
          userid: doc.userId
        };
        handler.postValidationResponse(req, res);
        return BluebirdPromise.resolve();
      })
      .catch(ErrorReplies.replyWithError200(req, res, vars.logger, OPERATION_FAILED));
  };
}

export function get_start_validation(handler: IdentityValidable,
  postValidationEndpoint: string,
  vars: ServerVariables)
  : Express.RequestHandler {
  return function (req: Express.Request, res: Express.Response)
    : BluebirdPromise<void> {
    let identity: Identity.Identity;

    return handler.preValidationInit(req)
      .then((id: Identity.Identity) => {
        identity = id;
        const email = identity.email;
        const userid = identity.userid;
        vars.logger.info(req, "Start identity validation of user \"%s\"",
          userid);

        if (!(email && userid))
          return BluebirdPromise.reject(new Exceptions.IdentityError(
            "Missing user id or email address"));

        return createAndSaveToken(userid, handler.challenge(),
          vars.userDataStore);
      })
      .then((token) => {
        const host = req.get("Host");
        const link_url = util.format("https://%s%s?token=%s", host,
          handler.destinationPath(), token);
        vars.logger.info(req, "Notification sent to user \"%s\"",
          identity.userid);
        return vars.notifier.notify(identity.email, handler.mailSubject(),
          link_url);
      })
      .then(() => {
        handler.preValidationResponse(req, res);
        return BluebirdPromise.resolve();
      })
      .catch(Exceptions.IdentityError, (err: Error) => {
        handler.preValidationResponse(req, res);
        return BluebirdPromise.resolve();
      })
      .catch(ErrorReplies.replyWithError401(req, res, vars.logger));
  };
}
