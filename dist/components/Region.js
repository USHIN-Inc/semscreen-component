"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _Point = _interopRequireDefault(require("./Point"));

var _Placeholder = _interopRequireDefault(require("./Placeholder"));

var _StyledRegion = _interopRequireDefault(require("./StyledRegion"));

var _RegionHeader = _interopRequireDefault(require("./RegionHeader"));

var _reactDnd = require("react-dnd");

var _ReactDnd = require("../constants/React-Dnd");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactRedux = require("react-redux");

var _messageActions = require("../actions/messageActions");

var _expandedRegionActions = require("../actions/expandedRegionActions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  min-height: ", ";\n  height: 100%;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var Region = function Region(props) {
  var region = props.region,
      points = props.points,
      cursorPosition = props.cursorPosition;
  var renderPoints = points.filter(function (p) {
    return p._id !== props.focusPointId;
  });
  var placeholderText = "New ".concat(region.toLowerCase(), " point");

  var placeholderImg = require("../images/".concat(region, ".svg"));

  var placeholderImgAlt = region;

  var _useDrop = (0, _reactDnd.useDrop)({
    accept: _ReactDnd.ItemTypes.POINT,
    hover: function hover(item) {
      //TODO: consider only calling appDispatch after the animation transition ends.
      if (item.quoted && item.shape !== region) return;

      if (props.isExpanded !== "expanded") {
        props.setExpandedRegion(region);
      }

      if (item.shape !== region || item.index !== points.length - 1 || item.pointId === props.focusPointId) {
        var newIndex = item.shape === region ? points.length - 1 : points.length;
        props.pointMove({
          pointId: item.pointId,
          oldShape: item.shape,
          oldIndex: item.index,
          newShape: region,
          newIndex: newIndex
        });
        item.index = newIndex;
        item.shape = region;
      }
    }
  }),
      _useDrop2 = _slicedToArray(_useDrop, 2),
      drop = _useDrop2[1];

  var onClickRemainingSpace = function onClickRemainingSpace() {
    if (props.isExpanded !== "expanded" && !props.readOnly) {
      props.pointCreate({
        point: {
          author: props.author,
          content: ""
        },
        shape: region,
        index: points.length
      });
    }
  };

  return /*#__PURE__*/_react.default.createElement(_StyledRegion.default, {
    isExpanded: props.isExpanded,
    borderColor: props.author.color,
    onClick: function onClick() {
      return props.setExpandedRegion(region);
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_RegionHeader.default, {
    shape: region,
    darkMode: props.darkMode
  }), renderPoints.map(function (p) {
    return /*#__PURE__*/_react.default.createElement(_Point.default, {
      key: p._id,
      point: p,
      shape: region,
      index: points.findIndex(function (point) {
        return point._id === p._id;
      }),
      readOnly: props.readOnly,
      isExpanded: props.isExpanded,
      isMainPoint: props.mainPointId === p._id,
      isSelected: props.selectedPoints.includes(p._id),
      cursorPositionIndex: cursorPosition && cursorPosition.pointId === p._id ? cursorPosition.index : undefined,
      darkMode: props.darkMode
    });
  }), props.isExpanded === "expanded" && !props.readOnly && /*#__PURE__*/_react.default.createElement(_Placeholder.default, {
    text: placeholderText,
    img: placeholderImg,
    imgAlt: placeholderImgAlt,
    onClick: function onClick() {
      props.createEmptyPoint(region, points.length);
    },
    darkMode: props.darkMode
  }), /*#__PURE__*/_react.default.createElement(DropTargetDiv, {
    ref: drop,
    isExpanded: props.isExpanded,
    onClick: onClickRemainingSpace
  })));
};

var DropTargetDiv = _styledComponents.default.div(_templateObject(), function (props) {
  return props.isExpanded ? "50px" : 0;
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    cursorPosition: state.cursorPosition.details,
    selectedPoints: state.selectedPoints.pointIds
  };
};

var mapDispatchToProps = {
  pointCreate: _messageActions.pointCreate,
  pointMove: _messageActions.pointMove,
  setExpandedRegion: _expandedRegionActions.setExpandedRegion
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Region);

exports.default = _default;