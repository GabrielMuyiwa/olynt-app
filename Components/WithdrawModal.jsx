import React, { useState } from "react";
import { ethers } from "ethers";

//INTERNAL IMPORT
import { IoMdClose } from "./ReactICON";
import PopUpInputField from "./Admin/RegularComp/PopUpInputField";
import PupUpButton from "./Admin/RegularComp/PupUpButton";

const WithdrawModal = ({
  withdraw,
  withdrawPoolID,
  address,
  setLoader,
  claimReward,
}) => {
  const [amount, setAmount] = useState("");

  const CALLING_FUNCTION = async (withdrawPoolID, amount) => {
    setLoader(true);
    const fee = ethers.utils.parseEther("0.000005");
    const receipt = await withdraw(withdrawPoolID, amount, {
      value: fee,
    });
    if (receipt) {
      setLoader(false);
      window.location.reload();
    }
    setLoader(false);
  };

  const CALLING_CLAIM = async (withdrawPoolID) => {
    setLoader(true);
    const receipt = await claimReward(withdrawPoolID);
    if (receipt) {
      setLoader(false);
      window.location.reload();
    }
    setLoader(false);
  };
  return (
    <div
      className="modal modal--auto fade"
      id="modal-node"
      tabIndex={-1}
      aria-labelledby="modal-node"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button
              className="modal__close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x">
                <IoMdClose />
              </i>
            </button>
            <h4 className="modal__title">Withdraw Token</h4>
            <p className="modal__text">
              <strong>⚠️ Early Withdrawal Warning:</strong> If you withdraw your staked
              tokens before the staking period ends, <strong>20% of your staked tokens
              will be permanently burned</strong> as an early withdrawal penalty. This
              action is irreversible.
            </p>
            <p className="modal__text" style={{ marginTop: "1rem" }}>
              <strong>Claiming your earned staking rewards is not affected</strong>
              and can be done at any time once rewards are available.
            </p>
            <div className="modal__form">
              <PopUpInputField
                title={"Amount"}
                placeholder={"amount"}
                handleChange={(e) => setAmount(e.target.value)}
              />
              <PupUpButton
                title={"Withdraw"}
                handleClick={() =>
                  CALLING_FUNCTION(withdrawPoolID, amount)
                }
              />
              <PupUpButton
                title={"Claim Reward"}
                handleClick={() => CALLING_CLAIM(withdrawPoolID)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
