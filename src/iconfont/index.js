/* eslint-disable prettier/prettier */
import React from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import { mapMarkerIcons } from "./mapMarkerIcons";
import { MapFont } from "./mapFont";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_885058_fq5654smvu9.js",
});

const MyFont = ({
  type,
  color = "",
  style = "",
  number = 0,
  selected = false,
  title = "",
  ...rest
}) => {
  if (mapMarkerIcons[type]) {
    return (
      <MapFont
        type={type}
        selected={selected}
        style={{ color, ...style }}
        alt={title}
        {...rest}
      />
    );
  } else {
    return (
      <IconFont
        type={`icon-${type}`}
        style={{ color, ...style }}
        alt={title}
        {...rest}
      />
    );
  }
};

MyFont.propTypes = { ...IconFont.propTypes };
MyFont.propTypes.color = PropTypes.string;
MyFont.propTypes.title = PropTypes.string; // optional 可用于地图marker
MyFont.propTypes.selected = PropTypes.bool; // optional 是否选中地图marker

export default MyFont;
