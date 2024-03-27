import React, { useState } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

const OTP = () => {
  const navigate = useNavigate();

  const storeduserData = localStorage.getItem("userData");
  const customerData = JSON.parse(storeduserData);

  const fullName = customerData?.fullName;
  const phoneNumber = customerData?.phoneNumber;
  const email = customerData?.email;
  const password = customerData?.password;
  const church = customerData?.church;
  const role = "member";
  const [loading, setLoading] = useState(false);

  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [otpValuesError, setOtpValuesError] = useState(false);

  const redirectToSignIn = () => {
    navigate("/agape/register");
  };

  const handleOtpChange = (index, value) => {
    if (value.length === 1 && !isNaN(value)) {
      const updatedOtpValues = [...otpValues];
      updatedOtpValues[index] = value;
      setOtpValues(updatedOtpValues);
    }
  };
  const handleConfirm = (e) => {
    e.preventDefault();
    setLoading(true);
    const otp = otpValues.join("");
    if (otpValues.some((value) => value === "")) {
      setOtpValuesError(true);
      setLoading(false);
      return;
    } else {
      setOtpValuesError(false);
    }
    if (otp) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const userId = userCredential.user.uid;
          const userData = {
            fullName: fullName,
            email: userCredential.user.email,
            phoneNumber: phoneNumber,
            church: church,
            role: role,
            adminId: "3XXjbBVSIycV9IitM19W6i6W84y2",
          };
          function generateChurchReferalCode(length) {
            function generateRandomDigits(length) {
              let randomDigits = "";
              const characters = "0123456789";

              for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(
                  Math.random() * characters.length
                );
                randomDigits += characters.charAt(randomIndex);
              }

              return randomDigits;
            }

            const randomDigits = generateRandomDigits(length);

            return `${randomDigits}`;
          }
          const referalCode = generateChurchReferalCode(5);

          navigate("/");
          const usersCollectionRef = doc(db, "users", userId);
          return setDoc(usersCollectionRef, {
            ...userData,
            userId,
            referalCode: referalCode,
          });
        })
        .then(() => {
          console.log("User registered successfully!");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          setLoading(false);
        });
        localStorage.removeItem("userData");
    }
  };

  return (
    <div className="flex flex-col items-center p-14">
      <div>
        <KeyboardBackspaceIcon
          className="text-slate-400 mb-10"
          onClick={redirectToSignIn}
        />
        <p className="text-3xl mb-5">Verification Code</p>
        <p className="text-slate-400">
          We have sent the verification code to your phone number
        </p>
        <div className="mt-10 flex flex-row justify-between">
          {otpValues.map((value, index) => (
            <input
              key={index}
              type="number"
              className={
                "border-1 border-gray-300 py-3 w-16 rounded-md text-center text-bold " + // Added space here
                (otpValuesError ? "border-red-500" : "")
              }
              maxLength={1}
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
            />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Button
            variant="contained"
            sx={{
              width: "100%",
              borderRadius: "50px",
              backgroundColor: "#BBF7D0",
              color: "black",
              height: "50px",
            }}
            onClick={handleConfirm}
          >
            {loading ? <CircularProgress /> : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTP;
