import React, { useState } from "react";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button, Divider } from "@mui/material";

const Campaign = ({ adminData, campaigns }) => {
  const [refCopiedNotification, setRefCopiedNotification] = useState(false);
  const [urlCopiedNotification, setUrlCopiedNotification] = useState(false);
  const [marketCopiedNotification, setMarketCopiedNotification] =
    useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const handleExpand = (index) => {
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
    }
  };
  const handleRefCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setRefCopiedNotification(true);
      setTimeout(() => {
        setRefCopiedNotification(false);
      }, 1000);
    } catch (error) {
      console.log("Unable to copy:", error);
    }
  };
  const handleURLCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setUrlCopiedNotification(true);
      setTimeout(() => {
        setUrlCopiedNotification(false);
      }, 1000);
    } catch (error) {
      console.log("Unable to copy:", error);
    }
  };
  const handleMarketCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setMarketCopiedNotification(true);
      setTimeout(() => {
        setMarketCopiedNotification(false);
      }, 1000);
    } catch (error) {
      console.log("Unable to copy:", error);
    }
  };

  const handleShare = async (textToShare) => {
    try {
      await navigator.share({ text: textToShare });
    } catch (error) {
      console.log("Sharing failed:", error);
    }
  };
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 sm:gap-10 mb-[50px]">
      {campaigns.map((item, index) => (
        <div className="border bg-white">
          <div className="">
            {Array.isArray(item.imagesURL) && item.imagesURL.length > 0 && (
              <Carousel showThumbs={false}>
                {item.imagesURL.map((url, i) => (
                  <div key={i}>
                    <img
                      src={url}
                      alt={`${item.campaignName}_${i}`}
                      className="object-fit w-full h-[350px]"
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
          <div key={index} className=" bg-white p-5 flex flex-col gap-3">
            <p className="text-xl font-medium">{item.campaignName}</p>
            <p className="text-slate-400 text-md font-medium">
              {item.description}
            </p>
            <div className="flex justify-between mt-5">
              <p className="text-slate-400">
                Goal: {item.fundraisingGoal.toLocaleString()}
                <small className="ml-2">GHS</small>
              </p>
              <p className="text-slate-400">
                Raised: {item.currentProgress.toLocaleString()}
                <small className="ml-2">GHS</small>
              </p>
            </div>
            <Divider />
            <div className="pt-5">
              <p className="text-sm text-slate-600">Referral Code</p>
              <div className="flex justify-between mt-2 border-b-1">
                <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                  {adminData.referralCode}
                </p>
                {refCopiedNotification ? (
                  <CheckIcon color="success" />
                ) : (
                  <ContentCopyIcon
                    fontSize="small"
                    onClick={() => handleRefCopy(adminData.referralCode)}
                  />
                )}
              </div>
            </div>
            <div className="pt-5">
              <div className="mt-2">
                <p className="text-sm text-slate-600">USSD Code</p>
                <div className="flex justify-between mt-2 border-b-1">
                  <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {" "}
                    *227*{item.serviceCode}*{adminData.referralCode}#
                  </p>
                  <div className="flex gap-2">
                    {urlCopiedNotification ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ContentCopyIcon
                        fontSize="small"
                        onClick={() =>
                          handleURLCopy(
                            `*227*${item.serviceCode}*${adminData.referralCode}#`
                          )
                        }
                      />
                    )}
                    <ShareRoundedIcon
                      fontSize="small"
                      onClick={() =>
                        handleShare(
                          `*227*${item.serviceCode}*${adminData.referralCode}#`
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 ">
                <p className="text-sm text-slate-600">Kowri Link</p>
                <div className="flex justify-between mt-2 border-b-1">
                  <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    https://collections.kowri.app/main/{item.serviceCode}/
                    {adminData.referralCode}
                  </p>
                  <div className="flex gap-2">
                    {marketCopiedNotification ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ContentCopyIcon
                        fontSize="small"
                        onClick={() =>
                          handleMarketCopy(
                            `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referralCode}#`
                          )
                        }
                      />
                    )}
                    <ShareRoundedIcon
                      fontSize="small"
                      onClick={() =>
                        handleShare(
                          `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referralCode}#`
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="pt-5 ">
                {expandedCard === index && (
                  <div>
                    <p className=" text-sm py-2 text-slate-600">Your Stats</p>
                    <div className="flex justify-between">
                      <p>Raised:</p>
                      <p>
                        <small>GHS</small>
                        {item.raised}
                      </p>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p>Doners:</p>
                      <p>{item.doners}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-2 bg-white float-right">
            <Button size="small" onClick={() => handleExpand(index)}>
              {expandedCard === index ? "Hide Stats" : "View Stats"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Campaign;