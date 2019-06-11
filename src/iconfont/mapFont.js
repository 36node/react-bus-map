/* eslint-disable prettier/prettier */
import React from "react";
import { Icon } from "antd";
import { mapMarkerIcons } from "./mapMarkerIcons";
import styled from "styled-components";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_885058_bf7a3awlilh.js",
});

export const MapFont = styled(
  ({ type, color, style, selected, title, status, className, ...rest }) => {
    const markerIcon = mapMarkerIcons[type];
    return (
      <div className={className} style={style}>
        <span className={`marker ${selected ? "selected" : ""}`}>
          <div className="before" />

          <IconFont type={`icon-${markerIcon.type}`} />

          <div className="after" />
        </span>
      </div>
    );
  }
)`
  .marker {
    width: 2em;
    height: 2em;
    display: block;
    position: relative;
    border-radius: 50%;
    background: ${props => mapMarkerIcons[props.type].backgroundColor};
    border: ${props => `.2em solid ${mapMarkerIcons[props.type].borderColor}`};
  }

  .marker .before,
  .marker .after {
    display: none;
  }

  .marker svg {
    color: ${props =>
      props.color || mapMarkerIcons[props.type].color || "white"};
    font-size: 1em;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-52%, -50%);
    z-index: 3;
  }

  .marker.selected {
    height: 4em;
    width: 3em;
    border-width: 0;
    background: transparent;
  }

  .marker.selected svg {
    top: 1.3em;
  }

  .marker.selected .before {
    background: ${props => {
      const markerIcon = mapMarkerIcons[props.type];
      return `linear-gradient(to bottom, ${
        markerIcon.borderColor
      }, ${markerIcon.borderTopColor || markerIcon.backgroundColor} 105%)`;
    }};
    height: 2.5em;
    width: 2.5em;
    display: block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    z-index: 1;
    border-radius: 50%;
    text-align: center;
  }
  .marker.selected:before {
    content: "";
    height: 2em;
    width: 2em;
    background: ${props => mapMarkerIcons[props.type].backgroundColor};
    display: block;
    position: absolute;
    top: 0.25em;
    left: 50%;
    transform: translate(-50%);
    z-index: 2;
    line-height: 2em;
    border-radius: 50%;
    text-align: center;
  }

  .marker.selected:after {
    content: "";
    height: 0;
    width: 0;
    display: block;
    position: absolute;
    top: 2.2em;
    left: 50%;
    transform: translate(-50%);
    border: 0 transparent solid;
    border-top-color: ${props =>
      mapMarkerIcons[props.type].borderTopColor ||
      mapMarkerIcons[props.type].backgroundColor};
    border-width: 1em 0.8em 0 0.8em;
  }
`;
