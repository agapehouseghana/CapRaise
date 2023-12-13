import {
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React from "react";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { orange } from "@mui/material/colors";
import {  db } from "../firebase/firebase";
import {  doc, setDoc } from "firebase/firestore";
import { useStateContext } from "../contexts/ContextProvider";


const AddCampaign = () => {
  const { adminData } =
  useStateContext();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const onCancel = () => setOpen(false);

  const [campaignName, setCampaignName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fundraisingGoal, setFundraisingGoal] = React.useState("");
  const [currentProgress, setCurrentProgress] = React.useState("");
  const [imageURL, setImageURL] = React.useState("");

  const campaignId = campaignName
  const createCampaign = (e) => {
    e.preventDefault();
    const adminId = adminData?.adminId;
    const campaignsCollectionRef = doc(db, `admins/${adminId}/campaigns`, campaignId);
  
    const campaignData = {
      campaignName: campaignName,
      description: description,
      adminId: adminId,
      fundraisingGoal: fundraisingGoal,
      currentProgress: currentProgress,
      imageURL: imageURL,
    };
  
    setDoc(campaignsCollectionRef, campaignData)
      .then(() => {
        console.log("Campaign created successfully!");
        setOpen(false)
      })
      .catch((error) => {
        console.error("Error creating campaign:", error);
      });
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
                type="text"
                label="Contact Infor"
                value={fundraisingGoal}
                onChange={(e) => setFundraisingGoal(e.target.value)}
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
                type="text"
                label="Contact Infor"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(e.target.value)}
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
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            onClick={createCampaign}
            style={{ background: "orange", color: "white" }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddCampaign;
