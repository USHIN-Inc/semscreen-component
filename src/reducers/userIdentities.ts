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
import { UserIdentity } from "../dataModels/dataModels";
import { Action, Actions } from "../actions/constants";
import { UserIdentityCreateParams } from "../actions/userIdentitiesActions";
import { AppState } from "./store";

import produce from "immer";

//TODO: Similar issue to initialDraftMessagesState - since the
//userIdentities data comes from Pouch, the type signature of
//currentIdentity has to be optional, which makes for weird rendering
//in the display components
export interface UserIdentitiesState {
  byId: {
    [_id: string]: UserIdentity;
  };
  allIds: string[];
  currentIdentity?: string;
}

export const initialUserIdentitiesState: UserIdentitiesState = {
  byId: {},
  allIds: [],
};

export const userIdentitiesReducer = (
  state = initialUserIdentitiesState,
  action: Action,
  appState: AppState
): UserIdentitiesState => {
  let newState = state;
  switch (action.type) {
    case Actions.userIdentityLoad:
      newState = handleUserIdentityCreate(
        state,
        action as Action<UserIdentityCreateParams>
      );
      break;
  }
  return newState;
};

function handleUserIdentityCreate(
  state: UserIdentitiesState,
  action: Action<UserIdentityCreateParams>
): UserIdentitiesState {
  return produce(state, (draft) => {
    draft.byId[action.params.userIdentity._id] = action.params.userIdentity;
    draft.allIds.push(action.params.userIdentity._id);
    draft.currentIdentity = action.params.userIdentity._id;
  });
}
