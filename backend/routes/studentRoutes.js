import express from "express";
import { protect, studentOnly } from "../middleware/authMiddleware.js";
import { getStudentProfile, updateStudentProfile } from "../controllers/studentController.js";
import { getUserBillings } from "../controllers/billingController.js";  // ✅ Now exported
import { createQuery, getUserQueries } from "../controllers/queryController.js";
import { getAllRooms } from "../controllers/roomController.js";
import { getTiffinPlans } from "../controllers/tiffinController.js";

const router = express.Router();

router.use(protect, studentOnly);

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/dashboard", (req, res) => {
  res.json({ message: "Student Dashboard" });
});
router.get("/rooms", getAllRooms);
router.get("/billings", getUserBillings);
router.get("/tiffin-plans", getTiffinPlans);
router.get("/queries", getUserQueries);
router.post("/queries", createQuery);

export default router;