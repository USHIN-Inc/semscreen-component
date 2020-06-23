/*
  Copyright (C) 2020 by USHIN, Inc.

  This file is part of U4U.

  U4U is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  U4U is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with U4U.  If not, see <https://www.gnu.org/licenses/>.
*/
import React, { useState } from "react";
import styled from "styled-components";
import Point from "./Point";
import Placeholder from "./Placeholder";
import { AuthorI, PointI } from "../interfaces";

// TODO: correct types below
const Region = (props: {
  region: string;
  isExpanded: boolean;
  author: AuthorI;
  points: PointI[];
  onPointCreate: any;
  onPointUpdate: any;
  onPointsDelete: any;
  onRegionClick: any;
}) => {
  const {
    region,
    isExpanded,
    points,
    author,
    onPointCreate,
    onPointUpdate,
    onPointsDelete,
    onRegionClick,
  } = props;

  //TODO: how to create points in the focus region - it has no shape
  const [isEditing, setIsEditing] = useState<PointI["pointId"]>("");

  // TODO: to consider: only create new point when content is truthy,
  // instead create temporary point until content is added?
  const handlePlaceholderClick = () => {
    onRegionClick(region, true);
    onPointCreate({
      author: { author },
      content: "",
      shape: region,
    });
  };

  return (
    <StyledRegion
      backgroundColor={author.styles.backgroundColor}
      onClick={() => onRegionClick(region, false)}
    >
      <ul className="list-unstyled">
        {points.map((p: any) => (
          <Point
            key={p.pointId}
            point={p}
            isEditing={isEditing === p.pointId ? true : false}
            setIsEditing={setIsEditing}
            onSubmit={onPointUpdate}
            onClick={() => onRegionClick(region, true)}
            onPointsDelete={onPointsDelete}
          />
        ))}
        {isExpanded && (
          <Placeholder shape={region} onClick={handlePlaceholderClick} />
        )}
      </ul>
    </StyledRegion>
  );
};

interface StyledRegionProps {
  backgroundColor: string;
}

const StyledRegion = styled.div<StyledRegionProps>`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.backgroundColor};
  overflow: auto;
`;
export default Region;
