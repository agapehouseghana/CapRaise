import { Button, Divider } from "@mui/material";
import React from "react";
import { campaigns } from "../utils/dummys";

const Campaigns = () => {
  return (
    <div className="p-10">
      <h1 className="text-4xl text-gray-600 mb-10 font-bold">Campaigns</h1>
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
      {campaigns.map((item, index) => (
        <div  key={index} className="border bg-white p-5 flex flex-col gap-3">
          <p className="text-xl font-medium">{item.title}</p>
          <p className="text-slate-400 text-md font-medium">
          {item.description}
          </p>
          <div className="flex justify-between mt-5">
            <p className="text-slate-400">
              Goal: {item.goalValue}<small className="ml-2">GHS</small>
            </p>
            <p className="text-slate-400">
              Raised: {item.raisedValue}<small className="ml-2">GHS</small>
            </p>
          </div>
          <Divider />
          <Button variant="text" onClick={""} style={{ background: "orange", color: "white" }}>
            Donate Now
          </Button>
        </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
