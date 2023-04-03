import { useContractWrite, usePrepareContractWrite, useAccount } from "wagmi";
import { QUICKER_CONTRACT_ABI, QUICKER_ADDRESS } from "../contractInformation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmBtn from "./confirmBtn";
import { useOrderStore } from "../pages/commission";
import {
  getAllowance,
  getLastClientOrder,
} from "../utils/GetOrderFromBlockchain";
import Handler from "../lib/Handler";

//Qkrw token contract information - polygon mumbai network
const Quicker_abi = QUICKER_CONTRACT_ABI;
const Quicker_address = QUICKER_ADDRESS;

interface Props {
  orderId: number;
  setOrderId: React.Dispatch<React.SetStateAction<number>>;
  data: object;
  _orderPrice: string;
  _deadLine: string;
}

interface ErrorProps {
  reason: string;
}

export default function CreateNewOrder({
  orderId,
  setOrderId,
  data,
  _orderPrice,
  _deadLine,
}: Props) {
  const {
    btnContent,
    setBtnContent,
    setShowAllowance,
    createdOrderNum,
    setCreatedOrderNum,
    setErrorMessage,
  } = useOrderStore();
  const [lastOrder, setLastOrder] = useState<string>("")
  const { address } = useAccount();
  const navigate = useNavigate()

  const { config } = usePrepareContractWrite({
    address: Quicker_address,
    abi: Quicker_abi,
    functionName: "createOrder",
    args: [_orderPrice, _deadLine],
    onSettled(data: any, error: any) {
      if (error) {
        let result: ErrorProps = JSON.parse(JSON.stringify(error));
        if (
          result.reason ===
          "execution reverted: ERC20: transfer amount exceeds balance"
        ) {
          setErrorMessage("QKRW토큰이 부족합니다.");
        } else {
          setErrorMessage("");
        }
      }
    },
  });

  const { isLoading, isSuccess, write } = useContractWrite({
    ...config,
    onSuccess() {
      getCreatedOrderNum();
    },
    onError(error) {
      console.log(error);
    },
  });

  const writeContract = async () => {
    // 토큰 사용 권한 체크 로직
    const allowanceData: any = await getAllowance(address);
    if (allowanceData._hex === "0x00") {
      setShowAllowance(true);
    }
    write?.();
  };

  const getCreatedOrderNum = async () => {
    const intervalId = setInterval(async () => {
      let newOrderNum = await getLastClientOrder(address);
      if (newOrderNum !== lastOrder) {
        setCreatedOrderNum(newOrderNum);
        console.log("새 오더넘버 탐색 완료")
        clearInterval(intervalId);
      } else {
        console.log("새 오더 번호 감지x")
      }
    }, 1000);
  };

  const getLastOrderFromBlochain = async () => {
    const result = await getLastClientOrder(address);
    if (result !== undefined) {
      setLastOrder(result)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      if (createdOrderNum !== undefined) {
        // db 데이터 저장 로직 수행
        (async () => {
          console.log("db 데이터 저장 로직");
          console.log("db에 저장할 오더번호: " + createdOrderNum);
          await setOrderId(parseInt(createdOrderNum));

          // 로직 마지막은 프로필 오더 내역으로 리다이렉트
        })();
      } else {
        console.log("createdOrderNum is null");
      }
    }
  }, [createdOrderNum]);

  useEffect(() => {
    if (orderId !== 0) {
      Handler.post(data, "http://localhost:9000/request");
      navigate("/")
    }
  }, [orderId]);

  useEffect(() => {
    if (isLoading) {
      setBtnContent("지갑서명 대기중...");
    }
  }, [isLoading]);

  useEffect(() => {
    getLastOrderFromBlochain()
    console.log("한 번만 실행하는 라스트 오더: " + lastOrder)
  }, [])

  return (
    <>
      <ConfirmBtn content={btnContent} confirmLogic={() => writeContract()} />
    </>
  );
}