import React from "react";

const Statistics = ({ poolDetails }) => {
  const pools = Array.isArray(poolDetails?.poolInfoArray)
    ? poolDetails.poolInfoArray.slice(0, 3)
    : [];

  return (
    <div className="section">
      <div className="container">
        <div className="row">
          {pools.map((pool, index) => (
            <div key={index} className="col-12 col-sm-6 col-xl-3">
              <div className="stats">
                <span className="stats__value">
                  {pool?.depositedAmount ?? "0"}&nbsp;
                  {pool?.depositToken?.symbol ?? ""}
                </span>
                <p className="stats__name">Current APY: {pool?.apy ?? 0} %</p>
              </div>
            </div>
          ))}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats">
              <span className="stats__value">
                {poolDetails?.totalDepositAmount ?? "0"}&nbsp;
                {poolDetails?.depositToken?.symbol ?? ""}
              </span>
              <p className="stats__name">Total Planted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;