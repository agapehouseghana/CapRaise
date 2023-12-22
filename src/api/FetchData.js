import React, { useState, useEffect } from "react";
import axios from "axios";

const FetchData = () => {
  const [externalData, setExternalData] = useState({
    payerPhoneNumber: "",
    referralCode: "",
    payerName: "",
    rail: "",
    amount: "",
    paymentChannel: "",
  });

  const fetchDataFromExternalAPI = async () => {
    try {
      const response = await axios.get("http://external-callback-api-url");
      setExternalData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDataFromExternalAPI();
  }, []); 

  const handleCallback = async () => {
    try {
      
      const response = await axios.post(
        "http://localhost:3000/process_callback",
        externalData
      );

      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
 
      <p>Payer Phone Number: {externalData.payerPhoneNumber}</p>

      <button onClick={handleCallback}>Send Callback to Backend</button>
    </div>
  );
};

export default FetchData;
