import React from "react";

// INTERNAL IMPORT
import {
  TiSocialTwitter,
  TiSocialLinkedin,
  TiSocialFacebook,
} from "./ReactICON/index";
import { TiSocialYoutube } from "react-icons/ti";

const Footer = () => {
  const social = [
    {
      link: "https://x.com/GrainFiOfficial?t=Esqghvqn8VJhfWhBEcT9CQ&s=09",
      icon: <TiSocialTwitter />,
    },
    {
      link: "https://youtube.com/@grainfi?si=-UhUDD8sienaMa7b",
      icon: <TiSocialYoutube />,
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8 col-md-6 col-lg-6 col-xl-4 order-1 order-lg-4 order-xl-1">
            <div className="footer__logo">
              <img src="img/logo.svg" alt="GrainFi Logo" />
            </div>
            <p className="footer__tagline">
              "Seeding the Future with Blockchain" <br />
              "🌾 Grow. Earn. Thrive. | Powered by GrainFi" <br />
            </p>
          </div>

          <div className="col-6 col-md-4 col-lg-3 col-xl-2 order-3 order-md-2 order-lg-2 order-xl-3 offset-md-2 offset-lg-0">
            <h6 className="footer__title">Company</h6>
            <div className="footer__nav">
              <a href="#">About GrainFi</a>
              <a href="#">Our news</a>
              <a href="#">License</a>
              <a href="#">Contacts</a>
            </div>
          </div>

          <div className="col-12 col-md-8 col-lg-6 col-xl-4 order-2 order-md-3 order-lg-1 order-xl-2">
            <div className="row">
              <div className="col-12">
                <h6 className="footer__title">Services & Features</h6>
              </div>
              <div className="col-6">
                <div className="footer__nav">
                  <a href="#">Invest</a>
                  <a href="#">Token</a>
                  <a href="#">Affiliate</a>
                  <a href="#">Contest</a>
                </div>
              </div>
              <div className="col-6">
                <div className="footer__nav">
                  <a href="#">Safety</a>
                  <a href="#">Automation</a>
                  <a href="#">Analytics</a>
                  <a href="#">Reports</a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3 col-xl-2 order-4 order-md-4 order-lg-3 order-xl-4">
            <h6 className="footer__title">Support</h6>
            <div className="footer__nav">
              <a href="#">Help center</a>
              <a href="https://medium.com/@grainfifarm/how-to-navigate-the-grainfi-dapp-a-step-by-step-guide-b45262cc11ec">How it works</a>
              <a href="#">Privacy policy</a>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>

        {/* A-Ads Banner - Responsive & Properly Fitting */}
        <div id="ad-container" style={{ textAlign: "center", margin: "20px 0" }}>
          <iframe
            data-aa="2381957"
            src="//acceptable.a-ads.com/2381957"
            style={{
              width: "100%",
              maxWidth: "728px",
              height: "auto",
              minHeight: "90px",
              border: "0px",
              padding: "0",
              overflow: "hidden",
              backgroundColor: "transparent",
            }}
          ></iframe>
          <a
            href="https://aads.com/campaigns/new/?source_id=2381957&source_type=ad_unit&partner=2381957"
            style={{ display: "block", textAlign: "right", fontSize: "12px" }}
          >
            Advertise here
          </a>
        </div>
        {/* End of A-Ads Banner */}

        <div className="row">
          <div className="col-12">
            <div className="footer__content">
              <div className="footer__social">
                {social.map((item, index) => (
                  <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.icon}
                  </a>
                ))}
              </div>
              <small className="footer__copyright">
                <a target="_blank" rel="noopener noreferrer">© {new Date().getFullYear()} GrainFi</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
