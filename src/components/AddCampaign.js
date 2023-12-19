import {
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { orange } from "@mui/material/colors";
import {  db } from "../firebase/firebase";
import {  addDoc, collection} from "firebase/firestore";
import { useStateContext } from "../contexts/ContextProvider";


const AddCampaign = ({setRefreshCampaigns}) => {
  const { adminData } =
  useStateContext();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const onCancel = () => setOpen(false);

  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [fundraisingGoal, setFundraisingGoal] = useState("");
  const [currentProgress, setCurrentProgress] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [campaignNameError, setCampaignNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [fundraisingGoalError, setFundraisingGoalError] = useState("");
  const [currentProgressError, setCurrentProgressError] = useState("");
  const [serviceCodeError, setServiceCodeError] = useState("");
  const [imageURLError, setImageURLError] = useState("");

  const [loading,setLoading]=useState(false)

  const createCampaign = (e) => {
    e.preventDefault();
    setLoading(true)

    if (campaignName === "") {
      setCampaignNameError(true);
            setLoading(false);
    } else {
      setCampaignNameError(false);
    }

    if (description === "") {
      setDescriptionError(true);
            setLoading(false);
    } else {
      setDescriptionError(false);
    }

    if (fundraisingGoal === "") {
      setFundraisingGoalError(true);
            setLoading(false);
    } else {
      setFundraisingGoalError(false);
    }

    if (currentProgress === "") {
      setCurrentProgressError(true);
            setLoading(false);
    } else {
      setCurrentProgressError(false);
    }

    if (serviceCode === "") {
      setServiceCodeError(true);
            setLoading(false);
    } else {
      setServiceCodeError(false);
    }

    if (imageURL === "") {
      setImageURLError(true);
            setLoading(false);
    } else {
      setImageURLError(false);
    }

    if (campaignName && description && fundraisingGoal&&currentProgress && imageURL) {
    const adminId = adminData?.adminId;
    const campaignsCollectionRef = collection(db, "campaigns");
  
    const campaignData = {
      campaignName: campaignName,
      description: description,
      serviceCode:serviceCode,
      adminId: adminId,
      fundraisingGoal: parseFloat(fundraisingGoal),
      currentProgress: parseFloat(currentProgress),
      imageURL: imageURL,
    };
  
    addDoc(campaignsCollectionRef, campaignData)
      .then((docRef) => {
        setOpen(false);
        setCampaignName("");
        setDescription("");
        setFundraisingGoal("");
        setCurrentProgress("");
        setImageURL("");
        setLoading(false)
        setRefreshCampaigns((prevRefresh) => !prevRefresh);
      })
      .catch((error) => {
        console.log("Error creating campaign:", error);
        setLoading(false)
      });
    }
  };
  
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<PlaylistAddIcon />}
        onClick={handleOpen}
        style={{ background: orange[500], color: "white" }}
      >
        Add Campaign
      </Button>
      <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Add Church</DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            required
            variant="outlined"
            margin="normal"
            size="small"
          >
            <InputLabel htmlFor="outlined-name">Campaign Name</InputLabel>
            <OutlinedInput
              id="outlined-name"
              type="text"
              label="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className={
                "border-1 px-3 py-4 rounded-md mb-5 " +
                (campaignNameError ? "border-red-500" : "")
              }
            />
          </FormControl>
          <FormControl
            fullWidth
            required
            variant="outlined"
            margin="normal"
            size="small"
          >
            <InputLabel htmlFor="outlined-address">Description</InputLabel>
            <OutlinedInput
              id="outlined-Address"
              type="text"
              label="Address"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={
                "border-1 px-3 py-4 rounded-md mb-5 " +
                (descriptionError ? "border-red-500" : "")
              }
            />
          </FormControl>
          <FormControl
            fullWidth
            required
            variant="outlined"
            margin="normal"
            size="small"
          >
            <InputLabel htmlFor="outlined-address">Kowri Service Code</InputLabel>
            <OutlinedInput
              id="outlined-Address"
              type="number"
              label="Address"
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              className={
                "border-1 px-3 py-4 rounded-md mb-5 " +
                (serviceCodeError ? "border-red-500" : "")
              }
            />
          </FormControl>
          <div className="grid grid-cols-2 gap-5">
            <FormControl
              fullWidth
              required
              variant="outlined"
              margin="normal"
              size="small"
            >
              <InputLabel htmlFor="outlined-contact">
                Fundraising Goal
              </InputLabel>
              <OutlinedInput
                id="outlined-contact"
                type="number"
                label="Contact Infor"
                value={fundraisingGoal}
                onChange={(e) => setFundraisingGoal(e.target.value)}
                className={
                  "border-1 px-3 py-4 rounded-md mb-5 " +
                  (fundraisingGoalError ? "border-red-500" : "")
                }
              />
            </FormControl>
            <FormControl
              fullWidth
              required
              variant="outlined"
              margin="normal"
              size="small"
            >
              <InputLabel htmlFor="outlined-contact">
                Current Progress
              </InputLabel>
              <OutlinedInput
                id="outlined-contact"
                type="number"
                label="Contact Infor"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(e.target.value)}
                className={
                  "border-1 px-3 py-4 rounded-md mb-5 " +
                  (currentProgressError ? "border-red-500" : "")
                }
              />
            </FormControl>
          </div>
          <FormControl
            fullWidth
            required
            variant="outlined"
            margin="normal"
            size="small"
          >
            <InputLabel htmlFor="outlined-address">Image URL</InputLabel>
            <OutlinedInput
              id="outlined-Address"
              type="text"
              label="Address"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              className={
                "border-1 px-3 py-4 rounded-md mb-5 " +
                (imageURLError ? "border-red-500" : "")
              }
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            onClick={createCampaign}
            style={{ background: "orange", color: "white" }}
          >
          {loading?<CircularProgress  size={20} />:"Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddCampaign;
