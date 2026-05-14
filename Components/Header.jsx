import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { MdGeneratingTokens } from "../Components/ReactICON/index";

const Header = ({ page }) => {
  const { address } = useAccount();

  const navigation = [
    { name: "Home", link: "#home" },
    { name: "Staking", link: "#staking" },
    { name: "Crypto", link: "#crypto" },
    { name: "Partners", link: "#partners" },
  ];

  return (
    <header style={{ backgroundColor: "#17142a" }} className="header">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="header__content">
              <button className="header__btn" type="button" aria-label="header__nav">
                <span />
                <span />
                <span />
              </button>

              <a href="/" className="header__logo">
                <img src="img/logo.svg" alt="GrainFi Logo" />
              </a>

              <span className="header__tagline">GRAINFI FARM</span>

              <ul className="header__nav" id="header__nav">
                {navigation.map((item, index) => (
                  <li key={index}>
                    <a
                      href={page === "activity" || page === "admin" ? "/" : `${item.link}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* A-Ads Banner with Mobile Optimization */}
              <div
                id="frame"
                style={{
                  width: "100%",
                  maxWidth: "728px",
                  height: "90px",
                  overflow: "hidden",
                  margin: "10px auto",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <iframe
                  data-aa="2381957"
                  src="//acceptable.a-ads.com/2381957"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "0px",
                    padding: "0",
                    backgroundColor: "transparent",
                  }}
                />
                <a
                  style={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                  id="frame-link"
                  href="https://aads.com/campaigns/new/?source_id=2381957&source_type=ad_unit&partner=2381957"
                >
                  Advertise here
                </a>
              </div>

              {/* Wallet Connect Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ConnectButton />
                <a
                  data-bs-target="#modal-deposit1"
                  type="button"
                  data-bs-toggle="modal"
                  className="header__profile"
                >
                  <i className="ti ti-user-circle">
                    <MdGeneratingTokens />
                  </i>
                  <span>Get GrainFi</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .header__nav {
              display: none; /* Hide nav on small screens */
            }

            #frame {
              height: 50px; /* Reduce ad size for mobile */
              max-width: 320px;
            }

            .header__content {
              flex-direction: column;
              align-items: center;
            }

            .header__profile {
              font-size: 14px;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Header;
