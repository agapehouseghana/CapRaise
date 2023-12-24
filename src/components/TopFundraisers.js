import { Divider } from "@mui/material";
import React from "react";


const TopFundraisers = ({usersLinkedToAdmin}) => {
    console.log(usersLinkedToAdmin,"usersLinkedToAdmin")
  return (
    <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
      {usersLinkedToAdmin.map((item, index) => (
        <div key={index} className="flex flex-col border  bg-white">
          <div className="text-2xl font-semibold p-4">
            <p className="text-2xl font-semibold">
              <small className="mr-1">GHS</small>
              {item.value}
            </p>
          </div>
          <Divider />
          <div className="p-4 ">
            <div className="flex justify-between">
              <p className="text-lg font-medium">{item.fullName}</p>
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
  );
};

export default TopFundraisers;
