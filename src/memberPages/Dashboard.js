import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Divider } from "@mui/material";
import { memberStatData } from "../utils/dummys";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

const Dashboard = () => {
  const { userData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const adminId = userData?.adminId;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      if (adminId) {
        const campaignsCollectionRef = collection(db, "campaigns");
        const q = query(
          campaignsCollectionRef,
          where("adminId", "==", adminId)
        );
        try {
          const querySnapshot = await getDocs(q);
          const campaignList = [];

          querySnapshot.forEach((doc) => {
            const campaignData = doc.data();
            campaignList.push(campaignData);
          });
          setCampaigns(campaignList);
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        }
        setLoading(false);
      } else {
        console.error("Admin ID is undefined or null");
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [adminId]);

  const handleExpand = (index) => {
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
    }
  };


  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
        <CircularProgress color="success" size={50} />
        </div>
      ) : (
        <div className="p-10">
          <h1 className="text-4xl text-gray-600 mb-10 font-bold">Dashboard</h1>
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
            {memberStatData.map((item, index) => (
              <div
                key={index}
                className="flex flex-row border p-4 items-center bg-white"
              >
                <div className="bg-gray-100 p-2 mr-5">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>
                  <p className="text-2xl font-semibold">
                    <small className="mr-1">{item.currency}</small>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[50px]">
            <p className="text-sm uppercase font-medium mb-3 bg-slate-200 w-max py-2 px-3">
              Campaigns
            </p>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 sm:gap-10">
              {campaigns.map((item, index) => (
                <div className="border bg-white">
                  <div className="">
                    <img
                      src={item.imageURL}
                      alt={item.campaignName}
                      className="object-fit w-full h-[350px]"
                    />
                  </div>
                  <div
                    key={index}
                    className=" bg-white p-5 flex flex-col gap-3"
                  >
                    <p className="text-xl font-medium">{item.campaignName}</p>
                    <p className="text-slate-400 text-md font-medium">
                      {item.description}
                    </p>
                    <div className="flex justify-between mt-5">
                      <p className="text-slate-400">
                        Goal: {item.fundraisingGoal}
                        <small className="ml-2">GHS</small>
                      </p>
                      <p className="text-slate-400">
                        Raised: {item.currentProgress}
                        <small className="ml-2">GHS</small>
                      </p>
                    </div>
                    <Divider />
                    <div className="pt-5">
                      <p className="text-sm text-slate-600">Referral Code</p>
                      <div className="flex justify-between mt-2 border-b-1">
                        <p>{item.referralCode}</p>
                        <ContentCopyIcon fontSize="small" />
                      </div>
                    </div>
                    <div className="pt-5">
                      <p className="text-sm text-slate-600">Referral Links</p>
                      <div className="flex justify-between mt-2 border-b-1">
                        <p>{item.USSDReferral}</p>
                        <div className="flex gap-2">
                          <ContentCopyIcon fontSize="small" />
                          <ShareRoundedIcon fontSize="small" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-10 border-b-1">
                        <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {item.KowriLinkReferral}
                        </p>
                        <div className="flex gap-2">
                          <ContentCopyIcon fontSize="small" />
                          <ShareRoundedIcon fontSize="small" />
                        </div>
                      </div>
                      <div className="pt-5 ">
                        {expandedCard === index && (
                          <div>
                            <p className=" text-sm py-2 text-slate-600">
                              Your Stats
                            </p>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
