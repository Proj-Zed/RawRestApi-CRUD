const router = require("express").Router();
const userRoute = require("./userRoutes");


router.use("/api/v1/user", userRoute);

module.exports = router;