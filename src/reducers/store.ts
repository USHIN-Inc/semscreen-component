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
import { initialAuthorsState, authorsReducer, AuthorsState } from "./authors";
import { initialPointsState, pointsReducer, PointsState } from "./points";
import {
  initialMessagesState,
  messagesReducer,
  MessagesState,
} from "./messages";
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

import { authors, messages, points } from "../constants/initialState";

let populatedInitialAuthorsState: AuthorsState | null = null;
let populatedInitialMessagesState: MessagesState | null = null;
let populatedInitialPointsState: PointsState | null = null;
let populatedInitialSemanticScreenState: SemanticScreenState | null = null;

// Set this to true if you want test data (you must delete localStorage)
const populateWithTestData = true;
if (populateWithTestData) {
  populatedInitialAuthorsState = authors;
  populatedInitialMessagesState = messages;
  populatedInitialPointsState = points;
}

const rawPersistedState = localStorage.getItem("draftMessages");
const persistedState = rawPersistedState ? JSON.parse(rawPersistedState) : null;
if (persistedState) {
  populatedInitialAuthorsState = persistedState.authors;
  populatedInitialMessagesState = persistedState.messages;
  populatedInitialPointsState = persistedState.points;
  populatedInitialSemanticScreenState = persistedState.semanticScreen;
}

export interface AppState {
  db: DBState;
  cursorPosition: CursorPositionState;
  authors: AuthorsState;
  points: PointsState;
  messages: MessagesState;
  expandedRegion: ExpandedRegionState;
  selectedPoints: SelectedPointsState;
  panels: PanelsState;
  drag: DragState;
  semanticScreen: SemanticScreenState;
}

function createAppStore() {
  const initialAppState: AppState = {
    db: initialDBState,
    cursorPosition: initialCursorPositionState,
    authors: populatedInitialAuthorsState ?? initialAuthorsState,
    points: populatedInitialPointsState ?? initialPointsState,
    messages: populatedInitialMessagesState ?? initialMessagesState,
    expandedRegion: initialExpandedRegionState,
    selectedPoints: initialSelectedPointsState,
    panels: initialPanelsState,
    drag: initialDragState,
    semanticScreen:
      populatedInitialSemanticScreenState ?? initialSemanticScreenState,
  };

  const appReducer = (state = initialAppState, action: Action): AppState => {
    let newState: AppState = {
      db: dbReducer(state.db, action, state),
      cursorPosition: cursorPositionReducer(
        state.cursorPosition,
        action,
        state
      ),
      authors: authorsReducer(state.authors, action, state),
      points: pointsReducer(state.points, action, state),
      messages: messagesReducer(state.messages, action, state),
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
