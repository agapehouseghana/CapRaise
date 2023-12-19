import { Button, CircularProgress, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import AddCampaign from "../components/AddCampaign";
import { useStateContext } from "../contexts/ContextProvider";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from '@mui/icons-material/Check';

const Campaigns = () => {
  const [refreshCampaigns, setRefreshCampaigns] = useState(false);

  const { adminData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  const adminId = adminData?.adminId;

  const [loading, setLoading] = useState(false);
  const [refCopiedNotification, setRefCopiedNotification] = useState(false);
  const [urlCopiedNotification, setUrlCopiedNotification] = useState(false);
  const [marketCopiedNotification, setMarketCopiedNotification] = useState(false);

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

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const campaignsCollectionRef = collection(db, "campaigns");
      const q = query(campaignsCollectionRef, where("adminId", "==", adminId));

      try {
        const querySnapshot = await getDocs(q);
        const campaign = [];
        querySnapshot.forEach((doc) => {
          const campaignsData = doc.data();
          campaign.push(campaignsData);
        });
        setCampaigns(campaign);
      } catch (error) {
        console.error("Error fetching users linked to admin:", error);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [adminId,refreshCampaigns]);
  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <CircularProgress color="success" size={50} />
        </div>
      ) : (
        <div className="p-10 flex flex-col">
          <h1 className="text-4xl text-gray-600 mb-10 font-bold">Campaigns</h1>
          <div className=" w-full">
            <div className="mb-10 float-right">
              <AddCampaign setRefreshCampaigns={setRefreshCampaigns}/>
            </div>
          </div>
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
                <div key={index} className=" bg-white p-5 flex flex-col gap-3">
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
                      <p>{adminData.referralCode}</p>
                      {refCopiedNotification ?(<CheckIcon color="success"/>): (
                      <ContentCopyIcon
                        fontSize="small"
                        onClick={() => handleRefCopy(adminData.referralCode)}
                      />)}
                    </div>
                  </div>
                  <div className="pt-5">
                    <p className="text-sm text-slate-600">Referral Links</p>
                    <div className="flex justify-between mt-2 border-b-1">
                      <p> *227*{item.serviceCode}*{adminData.referralCode}#</p>
                      <div className="flex gap-2">
                      {urlCopiedNotification ?(<CheckIcon  color="success"/>): (
                        <ContentCopyIcon
                          fontSize="small"
                          onClick={() =>
                            handleURLCopy(
                              `*227*${item.serviceCode}*${adminData.referralCode}#`
                            )
                          }
                        />)}
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
                    <div className="flex justify-between mt-10 border-b-1">
                      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        https://collections.kowri.app/main/{item.serviceCode}
                        /{adminData.referralCode}
                      </p>
                      <div className="flex gap-2">
                      {marketCopiedNotification ?(<CheckIcon  color="success"/>): (
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
      )}
    </>
  );
};

export default Campaigns;
