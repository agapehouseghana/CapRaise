import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { churchList } from "../../utils/dummys";
import fund from "../../utils/images/Image.png";
import { CircularProgress } from "@mui/material";

const AgapeRegister = () => {
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [church, setChurch] = useState("Agape");
  const role = "member";

  const [fullNameError, setFullNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [churchError, setChurchError] = useState(false);

  const navigate = useNavigate();

  const signUp = (e) => {
    e.preventDefault();
    setLoading(true);

    if (email === "") {
      setEmailError(true);
      setLoading(false);
    } else {
      setEmailError(false);
    }

    if (password === "") {
      setPasswordError(true);
      setLoading(false);
    } else {
      setPasswordError(false);
    }

    if (fullName === "") {
      setFullNameError(true);
      setLoading(false);
    } else {
      setFullNameError(false);
    }

    if (phoneNumber === "") {
      setPhoneNumberError(true);
      setLoading(false);
    } else {
      setPhoneNumberError(false);
    }

    if (church === "") {
      setChurchError(true);
      setLoading(false);
    } else {
      setChurchError(false);
    }

    if (email && password && fullName && phoneNumber && church) {
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
    }
  };
  const redirectToSignIn = () => {
    navigate("/agape");
  };
  return (
    <div className="md:flex-row flex-col  flex h-screen relative w-full">
      <div className="hidden md:flex md:flex-1 h-full">
        <img src={fund} alt="fundraiser" className="object-cover" />
      </div>
      <div
        className="h-full"
        style={{
          backgroundImage: `url(${fund})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="md:hidden h-full w-full absolute bg-black opacity-40"></div>
      <div className="flex md:flex-1 justify-center md:h-full  md:m-0 rounded-md w-[100%] absolute md:relative top-[20%] md:top-0 p-3">
          <div className=" bg-white w-full rounded-md">
        <form
          onSubmit={signUp}
          className="flex flex-col w-full xl:py-[200px] lg:py-[150px] md:py-[100px] xl:px-[150px] lg:px-[100px] md:px-[80px] sm:p-[80px] p-[30px]"
        >
          <h1 className="text-2xl font-medium mb-10">Create Account</h1>
          <input
            type="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={
              "border-1 px-3 py-4 rounded-md mb-5 " +
              (fullNameError ? "border-red-500" : "")
            }
          ></input>
          <input
            type="Phone Number"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={
              "border-1 px-3 py-4 rounded-md mb-5 " +
              (phoneNumberError ? "border-red-500" : "")
            }
          ></input>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              "border-1 px-3 py-4 rounded-md mb-5 " +
              (emailError ? "border-red-500" : "")
            }
          ></input>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={
              "border-1 px-3 py-4 rounded-md mb-5 " +
              (passwordError ? "border-red-500" : "")
            }
          ></input>
          <select
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            className={
              "border-1 px-3 py-4 rounded-md mb-5 " +
              (churchError ? "border-red-500" : "")
            }
            disabled={true}
          >
            <option value="TNJ71Eyh5whEzms5ALsccHvovth2">Agape</option>
            {churchList.map((church) => (
              <option key={church.id} value={church.name}>
                {church.name}
              </option>
            ))}
          </select>
          <div className="flex justify-between">
            <button
              type="button"
              className=" py-4 px-5 rounded-md w-[240px] font-semibold"
              onClick={redirectToSignIn}
            >
              Log In
            </button>
            <button
              type="submit"
              className="bg-green-200 py-4 px-5 rounded-md w-[240px] font-semibold"
            >
              {loading ? <CircularProgress size={20} /> : "Register"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default AgapeRegister;
