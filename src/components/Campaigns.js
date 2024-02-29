import React, { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button, Divider } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import Countdown from "react-countdown";

const Campaign = ({ adminData, campaigns }) => {
  const { externalData } = useStateContext();
  const [refCopiedNotification, setRefCopiedNotification] = useState(false);
  const [urlCopiedNotification, setUrlCopiedNotification] = useState(false);
  const [marketCopiedNotification, setMarketCopiedNotification] =
    useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [foundData, setFoundData] = useState([]);

  const getTotalRaisedForServiceCode = (serviceCode) => {
    const filteredData = foundData.filter(
      (data) => data.serviceCode === serviceCode
    );
    const totalAmount = filteredData.reduce(
      (total, item) => total + item.amount,
      0
    );
    return {
      totalAmount,
      count: filteredData.length,
    };
  };

  const getTotalRaisedForServiceAndReferral = (serviceCode, referalCode) => {
    const filteredData = foundData.filter(
      (data) =>
        data.referalCode === referalCode && data.serviceCode === serviceCode
    );
    const totalAmount = filteredData.reduce(
      (total, item) => total + item.amount,
      0
    );
    return {
      totalAmount,
      count: filteredData.length,
    };
  };

  const specificReferalCode = adminData?.referalCode;

  useEffect(() => {
    const newData = campaigns.flatMap((item) =>
      externalData?.filter((data) => data.serviceCode === item.serviceCode)
    );
    setFoundData(newData);
  }, [externalData, campaigns]);

  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    return difference > 0 ? difference : 0;
  };
  const calculatePercentage = (raised, goal) => {
    return (raised / goal) * 100;
  };

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
      const shareData = {
        title: "Agape House Church",
        text: "Hi there! It's Claud from Agape House New Testament Church. 🌟 We're on a mission to enhance our sanctuary through Capital Raise 2.0, creating more space for our growing family, from Kidz to Teens. Your support would mean so much to us. If you're able to contribute, every bit helps us move closer to our goal. 🙏 Thank you for considering supporting this cause. Together, we can make a big difference. God bless! 🕊️",
        url: textToShare,
      };
      await navigator.share(shareData);
    } catch (error) {
      console.log("Sharing failed:", error);
    }
  };
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 sm:gap-10 mb-[50px] w-auto">
      {campaigns.map((item, index) => {
        const { totalAmount } = getTotalRaisedForServiceCode(item.serviceCode);
        const { totalAmount: totalRaised, count: donorCount } =
          getTotalRaisedForServiceAndReferral(
            item.serviceCode,
            specificReferalCode
          );
        const timeLeft = calculateTimeLeft(item.endDate);
        const raisedPercentage = calculatePercentage(
          totalAmount,
          item.fundraisingGoal
        );
        return (
          <div className="border bg-white" key={index}>
            <div className="">
              {Array.isArray(item.imagesURL) && item.imagesURL.length > 0 && (
                <Carousel showThumbs={false}>
                  {item.imagesURL.map((url, i) => (
                    <div key={i}>
                      <img
                        src={url}
                        alt={`${item.campaignName}_${i}`}
                        className="object-cover w-auto md:h-[350px] h-[250px]"
                      />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
            <div key={index} className=" bg-white p-5 flex flex-col gap-3">
              <p className="text-3xl font-medium text-purple-500 mt-5">
                {item.campaignName}
              </p>
              <p className="text-slate-500 text-md font-medium">
                {item.description}
              </p>
              <div className="flex justify-between mt-10">
                <div className="flex flex-col">
                  <p className="text-xl font-medium ">
                    {item.fundraisingGoal.toLocaleString()}
                    <small className="ml-2">GHS</small>
                  </p>
                  <p className="text-slate-400">goal</p>
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="flex flex-col">
                  <p className="text-xl font-medium ">
                    {totalAmount.toLocaleString()
                      ? totalAmount.toLocaleString()
                      : item.currentProgress.toLocaleString()}
                    <small className="ml-2">GHS</small>
                  </p>
                  <p className="text-slate-400">raised</p>
                </div>
                <Divider orientation="vertical" flexItem />
                <Countdown
                  date={Date.now() + timeLeft}
                  renderer={({ days }) => (
                    <div>
                      <p className="text-xl font-medium ">{days}</p>
                      <p className="text-slate-400">days to go</p>
                    </div>
                  )}
                />
              </div>
              <div className="mt-10">
                <div className="h-4 bg-gray-200 rounded-full">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${raisedPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-center mt-1">
                  <span className="text-xs font-semibold text-gray-600">
                    {raisedPercentage}%
                  </span>
                </div>
              </div>
              <Divider />
              <div className="bg-white p-4 sm:p-10 rounded-xl">
                <div className="pt-5 ">
                  <p className="text-sm text-slate-600">Referral Code</p>
                  <div className="flex justify-between mt-2 border-b-1">
                    <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                      {adminData.referalCode}
                    </p>
                    {refCopiedNotification ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ContentCopyIcon
                        fontSize="small"
                        onClick={() => handleRefCopy(adminData.referalCode)}
                      />
                    )}
                  </div>
                </div>
                <div className="pt-5">
                  <div className="mt-2">
                    <p className="text-sm text-slate-600">
                      USSD Code (MTN Momo, Vodafone Cash, AirtelTigo Cash)
                    </p>
                    <div className="flex justify-between mt-2  items-center">
                      <p className="w-full overflow-hidden border-b-1 text-ellipsis whitespace-nowrap">
                        *227*{item.serviceCode}*{adminData.referalCode}#
                      </p>
                      <div className="flex gap-2 items-center ml-5">
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleShare(
                              `*227*${item.serviceCode}*${adminData.referalCode}#`
                            )
                          }
                          style={{ background: "white", color: "purple" }}
                        >
                          Share
                        </Button>
                        {urlCopiedNotification ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ContentCopyIcon
                            fontSize="small"
                            onClick={() =>
                              handleURLCopy(
                                `*227*${item.serviceCode}*${adminData.referalCode}#`
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pb-10">
                    <p className="text-sm text-slate-600">
                      Online Payment (Visa/Mastercard, Mobile Money)
                    </p>
                    <div className="flex justify-between mt-2 items-center">
                      <p className="w-full overflow-hidden text-ellipsis border-b-1 whitespace-nowrap">
                        https://collections.kowri.app/main/
                        {item.serviceCode}/{adminData.referalCode}
                      </p>
                      <div className="flex gap-2 items-center ml-5">
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleShare(
                              `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referalCode}#`
                              )
                          }
                          style={{ background: "white", color: "purple" }}
                        >
                          Share
                        </Button>

                        {marketCopiedNotification ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ContentCopyIcon
                            fontSize="small"
                            onClick={() =>
                              handleMarketCopy(
                                `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referalCode}#`
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <div className="pt-5">
                    {expandedCard === index && (
                      <div>
                        <p className=" text-md py-2 text-slate-600 font-semibold">
                          Your Stats
                        </p>
                        <div className="flex">
                          <div className="flex flex-col flex-1">
                            <p className="text-xl font-medium ">
                              {totalRaised} <small className="mr-2">GHS</small>
                            </p>
                            <p>raised</p>
                          </div>
                          <div className="flex flex-col flex-1">
                            <p className="text-xl font-medium ">{donorCount}</p>
                            <p>doners</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 bg-white float-right">
              <Button size="small" onClick={() => handleExpand(index)}>
                {expandedCard === index ? "Hide Stats" : "View Stats"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Campaign;
