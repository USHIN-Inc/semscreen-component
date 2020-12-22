/*
  Copyright (C) 2020 by USHIN, Inc.

  This file is part of U4U.

  U4U is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  U4U is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with U4U.  If not, see <https://www.gnu.org/licenses/>.
*/
import { Action, Actions } from "./constants";
import { ThunkAction } from "redux-thunk";
import { v4 as uuidv4 } from "uuid";

import { AppState } from "../reducers/store";
import {
  MessageI,
  PointI,
  PointReferenceI,
  UserIdentity,
} from "../dataModels/dataModels";
import { UserIdentityCreateParams } from "./userIdentitiesActions";
import { DisplayAppParams } from "./displayAppActions";
import { MessageDeleteParams } from "./draftMessagesActions";

import leveljs from "level-js";
import { USHINBase } from "ushin-db";

import randomColor from "randomcolor";

export interface LoadDatabaseParams {
  db: USHINBase;
}

export const loadDatabase = (): ThunkAction<
  void,
  AppState,
  unknown,
  Action<LoadDatabaseParams | UserIdentityCreateParams | DisplayAppParams>
> => {
  return (dispatch, getState) => {
    (async () => {
      const state = getState();

      if (!state.db.loading)
        return console.warn("Tried to load DB when already loaded");

      const leveldown = leveljs;
      const db = new USHINBase({ leveldown, authorURL: "author" });

      console.log("DB", db);
      await db.init();

      //For debugging
      (window as any).db = db;

      dispatch({
        type: Actions.loadDatabase,
        params: {
          db,
        },
      });

      //TODO: Add type guard isUserIdentity here
      let userIdentity = (await db.getAuthorInfo()) as UserIdentity;
      if (userIdentity.name === undefined || userIdentity.color === undefined) {
        await db.setAuthorInfo({
          ...userIdentity,
          name: "anonymous",
          color: randomColor(),
        });
        userIdentity = (await db.getAuthorInfo()) as UserIdentity;
      }
      dispatch({
        type: Actions.userIdentityLoad,
        params: {
          userIdentity,
        },
      });

      //Load currentMessage from a prior session; if none exists, create a
      //new message
      const rawLocalStorageState = localStorage.getItem("localStorageState");
      let localStorageState;
      if (rawLocalStorageState) {
        localStorageState = JSON.parse(rawLocalStorageState);
      }

      const currentMessage = localStorageState.semanticScreen.currentMessage;
      if (currentMessage !== undefined) {
        dispatch({
          type: Actions.setCurrentMessage,
          params: { messageId: currentMessage },
        });
      } else {
        const newMessageId = uuidv4();

        dispatch({
          type: Actions.messageCreate,
          params: { newMessageId },
        });
      }

      dispatch({
        type: Actions.displayApp,
        params: {},
      });
    })();
  };
};

export interface PointMapping {
  [id: string]: PointI | PointReferenceI;
}
export interface SaveMessageParams {
  message: MessageI;
  points: PointMapping;
}

export const saveMessage = (
  message: MessageI,
  points: PointMapping
): ThunkAction<
  void,
  AppState,
  unknown,
  Action<SaveMessageParams | MessageDeleteParams>
> => {
  return (dispatch, getState) => {
    (async () => {
      const state = getState();

      if (!state.db.db)
        return console.warn("Tried to save message before database was loaded");
      const db = state.db.db;

      try {
        const messageId = await db.addMessage(message, points);
        const publishedMessage = await db.getMessage(messageId);
        const publishedPoints = await db.getPointsForMessage(publishedMessage);
        dispatch({
          type: Actions.saveMessage,
          params: {
            message: publishedMessage,
            points: publishedPoints,
          },
        });
        dispatch({
          type: Actions.messageDelete,
          params: {
            messageId,
          },
        });
      } catch (e) {
        console.log(e);
      }
    })();
  };
};
