"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setExpandedRegion = void 0;

var _constants = require("./constants");

var setExpandedRegion = function setExpandedRegion(params) {
  return {
    type: _constants.Actions.setExpandedRegion,
    params: params
  };
};

exports.setExpandedRegion = setExpandedRegion;