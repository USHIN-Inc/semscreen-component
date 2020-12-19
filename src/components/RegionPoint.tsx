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
import React, { useEffect, useRef, useState } from "react";

import { PointI, PointReferenceI } from "../dataModels/dataModels";
import {
  getPointIfReference,
  getReferenceData,
} from "../dataModels/pointUtils";
import { ItemTypes, DraggablePointType } from "../constants/React-Dnd";
import Point from "./Point";
import PointHoverOptions from "./PointHoverOptions";

import { useDrop, DropTargetMonitor } from "react-dnd";
import { useDragPoint } from "../hooks/useDragPoint";
import { XYCoord } from "dnd-core";

import { connect } from "react-redux";
import { AppState } from "../reducers/store";
import {
  setCursorPosition,
  clearCursorPosition,
  CursorPositionParams,
} from "../actions/cursorPositionActions";
import {
  splitIntoTwoPoints,
  SplitIntoTwoPointsParams,
  combinePoints,
  CombinePointsParams,
  pointsMoveWithinMessage,
  PointsMoveWithinMessageParams,
  pointUpdate,
  PointUpdateParams,
  pointsDelete,
  PointsDeleteParams,
} from "../actions/draftPointsActions";
import { hoverOver, HoverOverParams } from "../actions/dragActions";
import {
  setSelectedPoints,
  SetSelectedPointsParams,
  togglePoint,
  TogglePointParams,
} from "../actions/selectPointActions";
import {
  setCurrentMessage,
  SetCurrentMessageParams,
} from "../actions/semanticScreenActions";

interface OwnProps {
  pointId: string;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  darkMode?: boolean;
}

interface AllProps extends OwnProps {
  point: PointI;
  referenceData: PointReferenceI | null;
  cursorPositionIndex?: number;
  isDraft: boolean;
  isDragHovered: boolean;
  splitIntoTwoPoints: (params: SplitIntoTwoPointsParams) => void;
  combinePoints: (params: CombinePointsParams) => void;
  setCursorPosition: (params: CursorPositionParams) => void;
  clearCursorPosition: () => void;
  pointsMoveWithinMessage: (params: PointsMoveWithinMessageParams) => void;
  pointUpdate: (params: PointUpdateParams) => void;
  pointsDelete: (params: PointsDeleteParams) => void;
  hoverOver: (params: HoverOverParams) => void;
  setSelectedPoints: (params: SetSelectedPointsParams) => void;
  togglePoint: (params: TogglePointParams) => void;
  setCurrentMessage: (params: SetCurrentMessageParams) => void;
}

const RegionPoint = (props: AllProps) => {
  const {
    point,
    referenceData,
    pointId,
    index,
    cursorPositionIndex,
    clearCursorPosition,
    setCursorPosition,
  } = props;

  const [, drop] = useDrop({
    accept: ItemTypes.POINT,
    hover: (item: DraggablePointType, monitor: DropTargetMonitor) => {
      setIsHovered(false); // Don't display PointHoverOptions

      const hoverIndex = index;
      const dragIndex = item.index;

      const hoverBoundingRect = pointRef.current?.div.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      let newIndex = hoverIndex;

      if (dragIndex === hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      if (dragIndex === hoverIndex && hoverClientY > hoverMiddleY) newIndex++;

      item.index = newIndex;
      item.region = point.shape;

      props.hoverOver({
        region: point.shape,
        index: newIndex,
      });
    },
    drop: () => {
      if (props.isDraft) {
        props.pointsMoveWithinMessage({});
      }
    },
  });

  const { drag, preview } = useDragPoint(pointId, index);

  //TODO: fix ref type
  const pointRef = useRef<any>(null);

  drag(pointRef.current?.img);
  drop(preview(pointRef.current?.div));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.pointUpdate({
      point: { ...point, content: e.target.value },
    });
  };

  const handleShapeIconClick = (e: React.MouseEvent) => {
    props.togglePoint({ pointId });
    e.stopPropagation();
  };

  const handlePointDivClick = (e: React.MouseEvent) => {
    if (props.isExpanded) {
      e.stopPropagation();
    }

    //TODO: Change the following gesture to a hoverOver button perhaps?
    props.setSelectedPoints({ pointIds: [] });
  };

  //TODO: Would it be possible to combine handleKeyDown with
  //handleChange?
  //TODO: place this function inside a useCallback hook?
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!props.isDraft) {
      return;
    } else {
      if (e.key === "Enter") {
        e.preventDefault();
        pointRef.current.textarea.selectionStart !== 0 &&
          props.splitIntoTwoPoints({
            pointId,
            sliceIndex: pointRef.current.textarea.selectionStart,
          });
      } else if (
        e.key === "Backspace" &&
        pointRef.current.textarea.selectionStart === 0 &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        if (index !== 0) {
          e.preventDefault();
          props.combinePoints({
            shape: point.shape,
            keepIndex: index - 1,
            deleteIndex: index,
          });
        } else if (index === 0 && !point.content) {
          e.preventDefault();
          props.combinePoints({
            shape: point.shape,
            keepIndex: index,
            deleteIndex: index + 1,
          });
        }
      } else if (
        e.key === "Delete" &&
        pointRef.current.textarea.selectionStart === point.content.length &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        e.preventDefault();
        props.combinePoints({
          shape: point.shape,
          keepIndex: index,
          deleteIndex: index + 1,
        });
      } else if (
        e.key === "ArrowLeft" &&
        pointRef.current.textarea.selectionStart === 0 &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd &&
        index !== 0
      ) {
        e.preventDefault();
        setCursorPosition({ moveTo: "endOfPriorPoint", pointId });
      } else if (
        e.key === "ArrowRight" &&
        pointRef.current.textarea.selectionStart === point.content.length &&
        pointRef.current.textarea.selectionStart ===
          pointRef.current.textarea.selectionEnd
      ) {
        e.preventDefault();
        setCursorPosition({
          moveTo: "beginningOfNextPoint",
          pointId,
        });
      } else if (e.key === "ArrowUp" && index !== 0) {
        setArrowPressed("ArrowUp");
      } else if (e.key === "ArrowDown") {
        setArrowPressed("ArrowDown");
      }
    }
  };

  const handleBlur = () => {
    if (!point.content) props.pointsDelete({ pointIds: [pointId] });
  };

  useEffect(() => {
    if (typeof cursorPositionIndex === "number") {
      pointRef.current?.textarea.focus();
      pointRef.current?.textarea.setSelectionRange(
        cursorPositionIndex as number,
        cursorPositionIndex as number
      );
      clearCursorPosition();
    }
  }, [cursorPositionIndex, clearCursorPosition]);

  const [arrowPressed, setArrowPressed] = useState<
    "ArrowUp" | "ArrowDown" | undefined
  >(undefined);
  useEffect(() => {
    if (arrowPressed === "ArrowUp") {
      (referenceData || pointRef.current?.textarea.selectionStart === 0) &&
        setCursorPosition({ moveTo: "beginningOfPriorPoint", pointId });
    } else if (arrowPressed === "ArrowDown") {
      (referenceData ||
        pointRef.current?.textarea.selectionStart === point.content.length) &&
        setCursorPosition({ moveTo: "beginningOfNextPoint", pointId });
    }
    setArrowPressed(undefined);
  }, [
    arrowPressed,
    point.content.length,
    referenceData,
    setCursorPosition,
    pointId,
  ]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Point
      id={props.pointId}
      displayPoint={props.point}
      referenceData={props.referenceData}
      isMainPoint={false}
      isSelected={props.isSelected}
      isHovered={isHovered}
      setIsHovered={setIsHovered}
      readOnlyOverride={!props.isDraft}
      darkMode={props.darkMode}
      handleChange={handleChange}
      handleKeyDown={handleKeyDown}
      handleBlur={handleBlur}
      handlePointDivClick={handlePointDivClick}
      handleShapeIconClick={handleShapeIconClick}
      ref={pointRef}
    >
      {isHovered && props.isDraft && (
        <PointHoverOptions
          type="point"
          id={props.pointId}
          darkMode={props.darkMode}
          isSelected={props.isSelected}
        />
      )}
    </Point>
  );
};

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const referenceData = getReferenceData(ownProps.pointId, state);
  const point = getPointIfReference(ownProps.pointId, state);

  let isDragHovered = false;
  if (
    state.drag.context &&
    state.drag.context.region === point.shape &&
    state.drag.context.index === ownProps.index
  )
    isDragHovered = true;

  return {
    point,
    referenceData,
    cursorPositionIndex:
      state.cursorPosition.details &&
      state.cursorPosition.details.pointId === ownProps.pointId
        ? state.cursorPosition.details.contentIndex
        : undefined,
    isDraft: state.draftMessages.allIds.includes(
      state.semanticScreen.currentMessage
    ),
    isDragHovered,
  };
};

const mapActionsToProps = {
  splitIntoTwoPoints,
  combinePoints,
  setCursorPosition,
  clearCursorPosition,
  pointsMoveWithinMessage,
  pointUpdate,
  pointsDelete,
  hoverOver,
  togglePoint,
  setSelectedPoints,
  setCurrentMessage,
};

export default connect(mapStateToProps, mapActionsToProps)(RegionPoint);