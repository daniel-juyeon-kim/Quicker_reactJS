const SocketIo = require("socket.io")
import saveMessage from "../Mongo/Command/SaveMessage";
import findMessage from "../Mongo/Command/FindMessages";

const main = (server : any) => {
  const io = SocketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })
  try {
    // 임의의 채팅방 이름
    let roomName = "";
    // 이벤트 설정
    io.on("connect", (socket: any) => {
      // 이벤트 관리
      socket.on("joinRoom", async (receiveRoomName: receiveRoomName) => {
        roomName = receiveRoomName.roomName
        console.log("접속 방 이름 : ", receiveRoomName);
        socket.join(roomName)
        // db 내용 불러옴
        const messages = await findMessage(roomName)
        if (messages !== undefined) {
          socket.emit("loadMessage", messages);
        }
      });
      socket.on("sendMessage",(receiveMessage: Message, done : Function) => {
        // 해당 방에 전부 메세지 보냄
        // 메세지, 아이디, 시간 포함
        socket.to(roomName).emit("sendMessage", {id: receiveMessage.sender, message : receiveMessage.data, date : new Date().toISOString });
        console.log("현재 접속 방 정보 : ", roomName)
        console.log("수신 메세지 : ", receiveMessage.data);
        saveMessage({id : receiveMessage.sender , roomName : roomName, receiveMessage : receiveMessage.data});
        done();
      },);
    });
  } catch (error) {
    console.error(error);
  }
};

interface Message {
  data: string;
  sender: string;
}

interface receiveRoomName {
  roomName : string
}

export default main;