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
import { Action } from "../actions/constants";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";

import {
  initialCursorPositionState,
  cursorPositionReducer,
  CursorPositionState,
} from "./cursorPosition";
import {
  initialUserIdentitiesState,
  userIdentitiesReducer,
  UserIdentitiesState,
} from "./userIdentities";
import { initialAuthorsState, authorsReducer, AuthorsState } from "./authors";
import {
  initialMessagesState,
  messagesReducer,
  MessagesState,
} from "./messages";
import { initialPointsState, pointsReducer, PointsState } from "./points";
import {
  initialDraftMessagesState,
  draftMessagesReducer,
  DraftMessagesState,
} from "./draftMessages";
import {
  initialDraftPointsState,
  draftPointsReducer,
  DraftPointsState,
} from "./draftPoints";
import {
  initialExpandedRegionState,
  expandedRegionReducer,
  ExpandedRegionState,
} from "./expandedRegion";
import {
  initialSelectedPointsState,
  selectedPointsReducer,
  SelectedPointsState,
} from "./selectedPoints";
import { initialPanelsState, panelsReducer, PanelsState } from "./panels";
import { initialDragState, dragReducer, DragState } from "./drag";
import {
  initialSemanticScreenState,
  semanticScreenReducer,
  SemanticScreenState,
} from "./semanticScreen";
import { initialDBState, DBState, dbReducer } from "./db";

import {
  userIdentites,
  authors,
  messages,
  points,
  draftMessages,
  draftPoints,
} from "../constants/initialState";

let populatedInitialUserIdentitiesState: UserIdentitiesState | null = null;
let populatedInitialAuthorsState: AuthorsState | null = null;
let populatedInitialMessagesState: MessagesState | null = null;
let populatedInitialPointsState: PointsState | null = null;
let populatedInitialDraftMessagesState: DraftMessagesState | null = null;
let populatedInitialDraftPointsState: DraftPointsState | null = null;

// Set this to true if you want test data (you must delete localStorage)
const populateWithTestData = true;
if (populateWithTestData) {
  populatedInitialUserIdentitiesState = userIdentites;
  populatedInitialAuthorsState = authors;
  populatedInitialMessagesState = messages;
  populatedInitialPointsState = points;
  populatedInitialDraftMessagesState = draftMessages;
  populatedInitialDraftPointsState = draftPoints;
}

const rawPersistedState = localStorage.getItem("localStorageState");
const persistedState = rawPersistedState ? JSON.parse(rawPersistedState) : null;
if (persistedState) {
  populatedInitialUserIdentitiesState = persistedState.userIdentities;
  populatedInitialAuthorsState = persistedState.authors;
  populatedInitialMessagesState = persistedState.messages;
  populatedInitialPointsState = persistedState.points;
  populatedInitialDraftMessagesState = persistedState.draftMessages;
  populatedInitialDraftPointsState = persistedState.draftPoints;
}

export interface AppState {
  db: DBState;
  userIdentities: UserIdentitiesState;
  cursorPosition: CursorPositionState;
  authors: AuthorsState;
  messages: MessagesState;
  points: PointsState;
  draftMessages: DraftMessagesState;
  draftPoints: DraftPointsState;
  expandedRegion: ExpandedRegionState;
  selectedPoints: SelectedPointsState;
  panels: PanelsState;
  drag: DragState;
  semanticScreen: SemanticScreenState;
}

function createAppStore() {
  const initialAppState: AppState = {
    db: initialDBState,
    userIdentities:
      populatedInitialUserIdentitiesState ?? initialUserIdentitiesState,
    cursorPosition: initialCursorPositionState,
    authors: populatedInitialAuthorsState ?? initialAuthorsState,
    messages: populatedInitialMessagesState ?? initialMessagesState,
    points: populatedInitialPointsState ?? initialPointsState,
    draftMessages:
      populatedInitialDraftMessagesState ?? initialDraftMessagesState,
    draftPoints: populatedInitialDraftPointsState ?? initialDraftPointsState,
    expandedRegion: initialExpandedRegionState,
    selectedPoints: initialSelectedPointsState,
    panels: initialPanelsState,
    drag: initialDragState,
    semanticScreen: initialSemanticScreenState,
  };

  const appReducer = (state = initialAppState, action: Action): AppState => {
    let newState: AppState = {
      db: dbReducer(state.db, action, state),
      userIdentities: userIdentitiesReducer(
        state.userIdentities,
        action,
        state
      ),
      cursorPosition: cursorPositionReducer(
        state.cursorPosition,
        action,
        state
      ),
      authors: authorsReducer(state.authors, action, state),
      messages: messagesReducer(state.messages, action, state),
      points: pointsReducer(state.points, action, state),
      draftMessages: draftMessagesReducer(state.draftMessages, action, state),
      draftPoints: draftPointsReducer(state.draftPoints, action, state),
      expandedRegion: expandedRegionReducer(
        state.expandedRegion,
        action,
        state
      ),
      selectedPoints: selectedPointsReducer(
        state.selectedPoints,
        action,
        state
      ),
      panels: panelsReducer(state.panels, action, state),
      drag: dragReducer(state.drag, action, state),
      semanticScreen: semanticScreenReducer(
        state.semanticScreen,
        action,
        state
      ),
    };
    return newState;
  };

  return createStore(appReducer, composeWithDevTools(applyMiddleware(thunk)));
}

export const store = createAppStore();
