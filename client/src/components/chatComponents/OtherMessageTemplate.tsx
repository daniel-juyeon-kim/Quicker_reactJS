import styled from "styled-components";
import { MessageInfoForComponent } from "./interface/MessageComponentInfo";
import TimeParser from "../../lib/TimeParser";

export default function OtherMessageTemplate ({message , date} : MessageInfoForComponent) {

  const time = TimeParser(date)

    return (
    <Div3>
      <Img2 src={Chatman}></Img2>{" "}
      <DivChat>
        <span>{message}</span>
      </DivChat>{" "}
      <Divclock>{time}</Divclock>
    </Div3>
  );
};

const Chatman = require("../../image/Chatman.png");

const Img2 = styled.img`
  width: 33px;
  height: 33px;
`;

const Div3 = styled.div`
  display: flex;
  margin: 10px 10px 10px 15px;
`;
const DivChat = styled.div`
  background-color: #f8f8f8;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 0px 5px 0px 10px;
  padding: 8px;
`;
const Divclock = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 8px;
  font-weight: thin;
  color: #adadad;
`;