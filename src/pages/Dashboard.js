import React, { useEffect, useState } from "react";
import { CircularProgress, Divider } from "@mui/material";
import { statData, dashTopFundraisers } from "../utils/dummys";
import MemberStatsBarChart from "../components/MemberStatsBarChart";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    setLoading(false)
  }, []);

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
        {statData.map((item, index) => (
          <div
            key={index}
            className="flex flex-row border p-4 items-center bg-white"
          >
            <div className="bg-gray-100 p-2 mr-5">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.title}</p>
              <p className="text-2xl font-semibold">
                <small className="mr-1">{item.currency}</small>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[50px]">
        <p className="text-sm uppercase font-medium mb-3">Charts</p>
        <div className="">
          <div className="w-max border bg-white">
            <MemberStatsBarChart data={dashTopFundraisers} />
          </div>
        </div>
      </div>

      <div className="mt-[50px]">
        <p className="text-sm uppercase font-medium mb-3">Top Fundraisers</p>
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
          {dashTopFundraisers.map((item, index) => (
            <div key={index} className="flex flex-col border  bg-white">
              <div className="text-2xl font-semibold p-4">
                <p className="text-2xl font-semibold">
                  <small className="mr-1">{item.currency}</small>
                  {item.value}
                </p>
              </div>
              <Divider />
              <div className="p-4 ">
                <div className="flex justify-between">
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-lg font-medium text-slate-500">
                    {item.doners} <small>doners</small>
                  </p>
                </div>
                <p className="text-sm float-right font-medium mt-2">
                  {item.campaign}
                </p>
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
