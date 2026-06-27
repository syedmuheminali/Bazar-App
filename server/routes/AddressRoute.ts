import express from "express";
import { protect } from "../middleware/Auth.js";
import { addAddresses, DeleteAddresses, getAddresses, updateAddresses } from "../controllers/addressController.js";


const AddressRoute = express.Router();

AddressRoute.post("/", protect, addAddresses);
AddressRoute.get("/", protect, getAddresses);
AddressRoute.put("/:id", protect, updateAddresses);
AddressRoute.delete("/:id", protect, DeleteAddresses);




export default AddressRoute;