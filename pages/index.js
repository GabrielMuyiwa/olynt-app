import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import AdsterraBanner from "../Components/AdsterraBanner";
import {
  Header,
  HeroSection,
  Footer,
  Pools,
  PoolsModel,
  WithdrawModal,
  Withdraw,
  Partners,
  Statistics,
  Token,
  Loader,
  Notification,
  ICOSale,
  Contact,
  Ask,
} from "../Components/index";

//import InPagePush from "../Components/InPagePush";

import {
  CONTRACT_DATA,
  deposit,
  withdraw,
  claimReward,
  addTokenToMetaMask,
} from "../Context/index";
import { LOAD_TOKEN_ICO } from "../Context/constants";

const index = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [contactUs, setContactUs] = useState(false);
  const [poolID, setPoolID] = useState();
  const [withdrawPoolID, setWithdrawPoolID] = useState();
  const [poolDetails, setPoolDetails] = useState();
  const [selectedPool, setSelectedPool] = useState();
  const [selectedToken, setSelectedToken] = useState();

  const LOAD_DATA = async () => {
    if (address) {
      console.log(address);
      setLoader(true);
      const data = await CONTRACT_DATA(address);
      setPoolDetails(data);
      setLoader(false);
    }
  };

  useEffect(() => {
    LOAD_DATA();

    const ref = router.query.ref;

    if (ref && address && ref !== address) {
      localStorage.setItem("referrer", ref);

      fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referrer: ref,
          referee: address,
        }),
      });
    }
  }, [address, router.query]);

  return (
    <div className="body-backgroundColor">
      <Header />
      <AdsterraBanner />
      <HeroSection
        poolDetails={poolDetails}
        addTokenToMetaMask={addTokenToMetaMask}
      />

      <div
        style={{
          display: "flex",
          gap: "15px",
          padding: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a href="/tasks">
          <button
            style={{
              padding: "12px 20px",
              background: "#00b894",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Task Center
          </button>
        </a>

        <a href="/referral">
          <button
            style={{
              padding: "12px 20px",
              background: "#0984e3",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Referral System
          </button>
        </a>
      </div>

      <Statistics poolDetails={poolDetails} />
      <Pools
        setPoolID={setPoolID}
        poolDetails={poolDetails}
        setSelectedPool={setSelectedPool}
        setSelectedToken={setSelectedToken}
      />
      <Token poolDetails={poolDetails} />
      <Withdraw
        setWithdrawPoolID={setWithdrawPoolID}
        poolDetails={poolDetails}
      />

      <Notification poolDetails={poolDetails} />
      <Partners />
      <Ask setContactUs={setContactUs} />
      <Footer />
      <PoolsModel
        deposit={deposit}
        poolID={poolID}
        address={address}
        selectedPool={selectedPool}
        selectedToken={selectedToken}
        setLoader={setLoader}
      />
      <WithdrawModal
        withdraw={withdraw}
        withdrawPoolID={withdrawPoolID}
        address={address}
        setLoader={setLoader}
        claimReward={claimReward}
      />
      <ICOSale setLoader={setLoader} />
      {contactUs && <Contact setContactUs={setContactUs} />}

      {loader && <Loader />}
    </div>
  );
};

export default index;