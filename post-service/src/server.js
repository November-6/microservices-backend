const express = require("express");
const app = express();
const mongoose = require("mongoose");

const postRoutes = require("./routes/post-service-routes");
const userContext = require("./middleware/user-context");

app.use(express.json()); 
app.use(userContext)
app.use("/api/posts", postRoutes);

//MongoDB-User1234
//email: purpleBurple


const connectToDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://abhinav4:MongoDB-User1234@postscluster-microservi.emvhvsn.mongodb.net/"
    );
    console.log("connected To DB Yay!")
  } catch (error) {
    console.log("error occured in connecting to db", error)
    process.exit(1)
  }
};

connectToDB()
app.listen(3002, () => {
  console.log("Post service running on port 3002");
});
