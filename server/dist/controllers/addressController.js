import Address from "../models/Address.js";
// GET user addresses
//GET /api/addresses
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({ success: true, data: addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Add new address
// POST /api/addresses
export const addAddresses = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const newAddress = await Address.create({ user: req.user._id, type, street, city, state, zipCode, country, isDefault: isDefault || false });
        res.status(201).json({ success: true, data: newAddress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update new address
// PUT /api/addresses
export const updateAddresses = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        let addressItem = await Address.findById(req.params.id);
        if (!addressItem) {
            return res.status(400).json({ success: false, message: "Address not found!" });
        }
        // Ensure user own address
        if (addressItem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        addressItem = await Address.findByIdAndUpdate(req.params.id, { type, street, city, state, zipCode, country, isDefault }, { new: true });
        res.status(200).json({ success: true, data: addressItem });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//Single address
// Delete address
export const DeleteAddresses = async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(400).json({ success: false, message: "Address not found!" });
        }
        // Ensure user own address
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        await address.deleteOne();
        res.status(200).json({ success: true, message: "Address removed" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
