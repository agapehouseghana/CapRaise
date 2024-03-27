import { CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import AddCampaign from "../components/AddCampaign";
import { useStateContext } from "../contexts/ContextProvider";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Campaign from "../components/Campaigns";

const Campaigns = () => {
  const [refreshCampaigns, setRefreshCampaigns] = useState(false);
  const { adminData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const adminId = adminData?.adminId;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const campaignsCollectionRef = collection(db, "campaigns");
      const q = query(campaignsCollectionRef, where("adminId", "==", adminId));

      try {
        const querySnapshot = await getDocs(q);
        const campaign = [];
        querySnapshot?.forEach((doc) => {
          const campaignsData = doc?.data();
          campaign?.push(campaignsData);
        });
        setCampaigns(campaign);
      } catch (error) {
        console.log("Error fetching users linked to admin:", error);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [adminId, refreshCampaigns]);
  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <CircularProgress color="success" size={50} />
        </div>
      ) : (
        <div className="p-3 sm:p-10 flex flex-col">
          <h1 className="text-4xl text-gray-600 mb-10 font-bold">Campaigns</h1>
          <div className=" w-full">
            <div className="mb-10 float-right">
              <AddCampaign setRefreshCampaigns={setRefreshCampaigns} />
            </div>
          </div>
          <Campaign adminData={adminData} campaigns={campaigns} />
        </div>
      )}
    </>
  );
};

export default Campaigns;
