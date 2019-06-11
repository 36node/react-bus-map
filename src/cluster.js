import React from "react";
import ReactDOMServer from "react-dom/server";
import styled from "styled-components";

const M = {
  STOP: ["#909090", "#eaeaea"],
  CHARGING: ["#007FAB", "#c5ecfc"],
  RUNNING: ["#00AB37", "#cdf6c7"],
  REPAIRING: ["#A44E00", "#f9debb"],
  "ALARM-3": ["#EF6E6E", "#f7b7b7"],
  "ALARM-2": ["#F58E42", "#fed3c1"],
  "ALARM-1": ["#FFB626", "#ffe3ac"],
  undefined: ["#909090", "#eaeaea"],
};
const priorities = [
  "STOP",
  "CHARGING",
  "RUNNING",
  "REPAIRING",
  "ALARM-3",
  "ALARM-2",
  "ALARM-1",
];

// const Point = styled.div`
//   font-size: 17px;
//   background: ${props =>
//     props.mainStatus && stauts[props.mainStatus]
//       ? stauts[props.mainStatus][0]
//       : "#EF6E6E"};
//   border: 3px solid;
//   border-color: ${props =>
//     props.mainStatus && stauts[props.mainStatus]
//       ? stauts[props.mainStatus][1]
//       : "#F4A9A9"};
//   padding-top: 0px;
//   padding-left: 0px;
//   width: 40px;
//   height: 40px;
//   line-height: 35px;
//   border-radius: 50%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

const Outer = styled.div`
  width: 3rem;
  height: 3rem;
  border: 5px solid ${props => M[props.status][1]};
  background-color: ${props => M[props.status][0]};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PointNumber = styled.div`
  color: white;
  font-size: 1rem;
`;

export default ({ vehicles = [], asJSX = false }) => {
  let pIndex = 0;
  vehicles.forEach(v => {
    const index = priorities.indexOf(v.state);
    pIndex = index > pIndex ? index : pIndex;
  });

  const status = priorities[pIndex];
  const number = vehicles.length;
  const domJSX = (
    <Outer status={status}>
      <PointNumber>{number}</PointNumber>
    </Outer>
  );
  return asJSX ? domJSX : ReactDOMServer.renderToStaticMarkup(domJSX);
};

// obsoleted
export const getClusterColor = markers => {
  let pIndex = 0;
  markers.forEach(m => {
    const index = priorities.indexOf(m.state);
    pIndex = index > pIndex ? index : pIndex;
  });

  const mainStatus = priorities[pIndex];
  return M[mainStatus];
};
