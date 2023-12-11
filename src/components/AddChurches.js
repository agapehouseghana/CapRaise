import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  // FormHelperText,
} from "@mui/material";
import { orange } from '@mui/material/colors'
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { Visibility, VisibilityOff } from "@mui/icons-material";



const AddChurches = () => {

  const [showPassword, setShowPassword] = useState(false);
  // const [passwordError, setPasswordError] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const onCancel = () => setOpen(false);
  const [name, setName] = React.useState( "");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const role ="admin";


  const createAdmin = (e) => {
    e.preventDefault();
  
    if (!email) {
      console.error("Email is required");
      return; 
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const adminId = userCredential.user.uid;
        const adminData = {
          churchName: name,
          churchPhoneNumber: phoneNumber,
          churchEmail: userCredential.user.email,
          role: role,
        };
        const adminsCollectionRef = doc(db, "admins", adminId);
        return setDoc(adminsCollectionRef, { ...adminData, adminId });
      })
      .then(() => {
        console.log("Admin (church) created successfully!");
      })
      .catch((error) => {
        console.error("Error creating admin (church):", error);
      });
  };

  
  
  
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<PlaylistAddIcon />}
        onClick={handleOpen}
        style={{ background: orange[500], color: "white" }} 
      >
        Add Church
      </Button>
      <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Add Church</DialogTitle>
        <DialogContent>
          <FormControl fullWidth required variant="outlined" margin="normal">
            <InputLabel htmlFor="outlined-name">Church Name</InputLabel>
            <OutlinedInput
              id="outlined-name"
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth required variant="outlined" margin="normal">
            <InputLabel htmlFor="outlined-address">Church Email</InputLabel>
            <OutlinedInput
              id="outlined-Address"
              type="text"
              label="Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth required variant="outlined" margin="normal">
            <InputLabel htmlFor="outlined-contact">Phone Number</InputLabel>
            <OutlinedInput
              id="outlined-contact"
              type="number"
              label="Contact Infor"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
          <FormControl variant="outlined" margin="normal" fullWidth required>
            <InputLabel htmlFor="outlined-password" required>
              Password
            </InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? "text" : "password"}
              // className={`w-full ${passwordError ? "border-red-500" : ""}`}
              required
              // error={passwordError}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {/* <FormHelperText error={passwordError}>
              {passwordError ? "Password is required" : ""}
            </FormHelperText> */}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            onClick={createAdmin}
            style={{ background: "orange", color: "white" }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddChurches;
