import React, { useEffect } from "react";
import { Page } from "../Page";

export type PopupContentType =
  | "startGame"
  | "congratulations"
  | "tryAgain"
  | null;

interface ModalPopupProps {
  isVisible: boolean;
  onClose: () => void;
  contentType?: PopupContentType;
  promoCode?: string;
}

const ModalPopup: React.FC<ModalPopupProps> = ({
  isVisible,
  onClose,
  contentType,
  promoCode,
}) => {
  useEffect(() => {}, []);

  const renderTypedContent = () => {
    switch (contentType) {
      case "startGame":
        return (
          <div className="text-center py-4">
            <p className="text-h3-bold">До начала игры</p>{" "}
            <p
              className="text-[#34C759] font-bold text-[34px] leading-[63px] tracking-[-0.08px]"
              style={{ fontWeight: "700" }}
            >
              05:00
            </p>
          </div>
        );
      case "congratulations":
        return (
          <div className="flex flex-col items-center justify-center text-center gap-[16px]">
            <div className="text-[34px]">🥳</div>
            <div className="flex flex-col gap-[9px]">
              <span className="text-h3-bold text-[white]">
                Congratulations!
              </span>
              <p className="text-[13px] font-[400] leading-[18px] tracking-[-0.08px] text-[white]">
                Покажите этот код ведущему
              </p>
              <div className="bg-[#707579] rounded-[10px] min-h-[128px] flex items-center justify-center">
                {promoCode}
              </div>
            </div>
            <button
              onClick={onClose}
              className="button-yellow h-[42px] text-h4-bold w-full"
            >
              Good!
            </button>
          </div>
        );
      case "tryAgain":
        return (
          <div className="flex flex-col items-center justify-center text-center gap-[16px]">
            <div className="flex flex-col gap-[9px]">
              <div className="text-[34px]">😓</div>
              <span className="text-h3-bold text-[white]">Ничего не вышло</span>
              <p className="text-[13px] font-[400] leading-[18px] tracking-[-0.08px] text-[white]">
                В этот раз вам не попался приз, но еще обязательно повезет!
              </p>
            </div>
            <button
              onClick={onClose}
              className="button-yellow h-[42px] text-h4-bold w-full"
            >
              Good!
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Page back={false}>
      <div
        className="h-[100vh] w-[100vw] fixed inset-0 flex justify-center items-center z-50"
        style={{
          backdropFilter: "brightness(0.75) blur(3px)",
        }}
      >
        <div className="bg-[#171717] w-[100%] text-white mx-[60px] pt-[19px] px-[16px] pb-[15px] rounded-[14px]">
          {renderTypedContent()}
        </div>
      </div>
    </Page>
  );
};

export default ModalPopup;
