import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fund from "../../utils/images/fund.jpeg"

const AgapeSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const navigate = useNavigate();

  const signIn = (e) => {
    e.preventDefault();
    if (email === "") {
      setEmailError(true);
    } else {
      setEmailError(false);
    }

    if (password === "") {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential);
          navigate("/");
        })
        .catch((error) => {
          const errorMessage = error.message;
          console.log("Sign In Error:", errorMessage);
          toast.error("Invalid email or password");
        });
    }
  };

  const redirectToRegister = () => {
    navigate("/agape/register");
  };

  return (
    <>
      <div className="md:flex-row flex-col  flex h-screen relative">
        <div className="hidden md:flex md:flex-1 h-full">
        <img src={fund} alt="fundraiser" className="object-fit"/>
        </div>
        <div className="h-full "  style={{ backgroundImage: `url(${fund})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="flex md:flex-1 justify-center md:h-full bg-white m-10 md:m-0 rounded-md">
            <form
              onSubmit={signIn}
              className="flex flex-col w-full xl:py-[200px] lg:py-[150px] md:py-[100px] xl:px-[150px] lg:px-[100px] md:px-[80px] sm:p-[80px] p-[40px]"
            >
              <div>
                <h1 className="text-lg font-medium mb-2 text-slate-500">
                  Welcome Back
                </h1>
                <h1 className="text-2xl font-medium mb-10">
                  Log In to your Account
                </h1>
              </div>
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
              <div className="flex justify-between">
                <button
                  type="button"
                  className="py-4 px-5 rounded-md w-[240px] font-semibold"
                  onClick={redirectToRegister}
                >
                  Register
                </button>
                <button
                  type="submit"
                  className="bg-green-200 py-4 px-5 rounded-md w-[240px] font-semibold"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgapeSignIn;
