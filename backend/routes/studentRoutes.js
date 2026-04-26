import express from "express";
import { protect, studentOnly } from "../middleware/authMiddleware.js";
import { getStudentProfile, updateStudentProfile, verifyStudentPassword } from "../controllers/studentController.js";
import { getUserBillings } from "../controllers/billingController.js";
import { createQuery, getUserQueries } from "../controllers/queryController.js";
import { getAllRooms, getStudentRoom } from "../controllers/roomController.js";
import { getMyMealRecords } from "../controllers/mealController.js";

const router = express.Router();

router.use(protect, studentOnly);

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.post("/profile/verify-password", verifyStudentPassword);
router.get("/dashboard", (req, res) => {
  res.json({ message: "Student Dashboard" });
});
router.get("/my-room", getStudentRoom);
router.get("/rooms", getAllRooms);
router.get("/billings", getUserBillings);
// Query routes
router.get("/queries", getUserQueries);
router.post("/queries", createQuery);
// Meal records route
router.get("/meal-records", getMyMealRecords);

export default router;
