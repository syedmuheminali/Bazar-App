import express from "express";
import { protect } from "../middleware/Auth.js";
import { addAddresses, DeleteAddresses, getAddresses, updateAddresses } from "../controllers/addressController.js";
const AddressRoute = express.Router();
AddressRoute.get("/", protect, getAddresses);
AddressRoute.get("/", protect, addAddresses);
AddressRoute.get("/:id", protect, updateAddresses);
AddressRoute.get("/:id", protect, DeleteAddresses);
export default AddressRoute;
