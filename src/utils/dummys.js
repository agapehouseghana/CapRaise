import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import ReduceCapacityOutlinedIcon from "@mui/icons-material/ReduceCapacityOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChurchOutlinedIcon from "@mui/icons-material/ChurchOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export const links = [
  {
    name: "Dashboard",
    icon: <InventoryOutlinedIcon />,
  },
  {
    name: "Fundraisers",
    icon: <PeopleOutlineOutlinedIcon />,
  },
  {
    name: "Campaigns",
    icon: <CampaignOutlinedIcon />,
  }
];
export const superAdminLinks = [
  {
    name: "Dashboard",
    icon: <InventoryOutlinedIcon />,
  },
  {
    name: "Fundraisers",
    icon: <PeopleOutlineOutlinedIcon />,
  },
  {
    name: "Campaigns",
    icon: <CampaignOutlinedIcon />,
  },
  {
    name: "Churches",
    icon: <ChurchOutlinedIcon />,
  },
  {
    name: "Community",
    icon: <ReduceCapacityOutlinedIcon />,
  },
  {
    name: "Reports",
    icon: <AssessmentOutlinedIcon />,
  },
];

export const memberLinks = [
  {
    name: "Dashboard",
    icon: <InventoryOutlinedIcon />,
  },
];

export const churchList = [
  { id: 1, name: "Light House Church" },
  { id: 2, name: "Pentecost Church" },
  { id: 3, name: "Living Word Church" },
];

export const statData = [
  {
    icon: (
      <AccountBalanceWalletOutlinedIcon
        fontSize="large"
        className="text-slate-500"
      />
    ),
    title: "Total Raised",
    currency: "GHS",
    value: "34.8K",
  },
  {
    icon: (
      <PeopleOutlineOutlinedIcon
        fontSize="large"
        className="text-slate-500"
      />
    ),
    title: "Total Fundraisers",
    currency: "",
    value: "48",
  },
  {
    icon: <GroupsOutlinedIcon fontSize="large" className="text-slate-500" />,
    title: "Total Donors",
    currency: "",
    value: "107",
  },
  {
    icon: (
      <FavoriteBorderOutlinedIcon
        fontSize="large"
        className="text-slate-500"
      />
    ),
    title: "Campaigns",
    currency: "",
    value: "3",
  },
];
export const memberStatData = [
  {
    icon: (
      <AccountBalanceWalletOutlinedIcon
        fontSize="large"
        className="text-slate-500"
      />
    ),
    title: "Total Raised",
    currency: "GHS",
    value: "34.8K",
  },
  {
    icon: <GroupsOutlinedIcon fontSize="large" className="text-slate-500" />,
    title: "Total Donors",
    currency: "",
    value: "107",
  },
  {
    icon: (
      <FavoriteBorderOutlinedIcon
        fontSize="large"
        className="text-slate-500"
      />
    ),
    title: "Campaigns",
    currency: "",
    value: "2",
  },
];
export const dashTopFundraisers = [
  {
    name: "David King",
    currency: "GHS",
    value: "34,00",
    doners:"49",
    campaign:"Help the Orphan Campaign"
  },
  {
    name: "Kofi John",
    currency: "GHS",
    value: "292",
    doners:"4",
    campaign:"Help the Orphan Campaign"
  },
  {
    name: "Kudus Mafia",
    currency: "GHS",
    value: "930",
    doners:"9",
    campaign:"Help the Orphan Campaign"
  },
  {
    name: "Atu Chris",
    currency: "GHS",
    value: "34",
    doners:"1",
    campaign:"Help the Orphan Campaign"
  },

];
export const fundraiser = [
  {
    firstName: "David ",
    lastName: "King",
    email: "david@gmail.com",
    mobileNumber:"0203465176",
    referralCode:"K9I9N0G"
  },
  {
    firstName: "Chris",
    lastName: "Atu",
    email: "chris@gmail.com",
    mobileNumber:"0203465176",
    referralCode:"C9H9R0I"
  },
];
export const churches = [
  {
    churchName: "Light House Church ",
    address: "Tema",
    contactInfo: "david@gmail.com",
  },
  {
    churchName: "Pentecost Church",
    address: "Accra",
    contactInfo: "Pent@gmail.com",
  },
  {
    churchName: "Living Word Church",
    address: "North",
    contactInfo: "word@gmail.com",
  }
];
export const campaigns = [
  {
    image:"https://th.bing.com/th/id/OIP.NoDQSpgDUcl-J-WhXUDKAQHaDx?w=296&h=178&c=7&r=0&o=5&pid=1.7",
    imageAlt:"capital2.0",
    title: "Capital Raise 2.0",
    description: "Raise Funds for the broke boys,Raise Funds for the broke boys,Raise Funds for the broke boys,Raise Funds for the broke boys",
    goalValue: "100,000",
    raisedValue: "10,000",
    referralCode:"eiuhihfhwnwojjej",
    USSDReferral:"*227*1234*eiuhihfhwnwojjej#",
    KowriLinkReferral:"https://collections.kowri.app/main/1234/eiuhihfhwnwojjej",
    raised:"20,000",
    doners:"20",
  },
  {
    image:"https://www.fundraisingshoppingcart.com/images/fundraisingboy.png",
    title: "Raise Funds for the broke boys ",
    description: "Raise Funds for the broke boys,Raise Funds for the broke boys,Raise Funds for the broke boys,Raise Funds for the broke boys",
    goalValue: "100,000",
    raisedValue: "90,000",
  }
];

