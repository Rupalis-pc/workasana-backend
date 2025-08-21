const { initializeDatabase } = require("./db/db.connect");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const teamRoutes = require("./routes/team.routes");
const tagRoutes = require("./routes/tag.routes");
const reportRoutes = require("./routes/report.routes");
const projectRoutes = require("./routes/project.routes");
const memberRoutes = require("./routes/members.routes");

const app = express();
initializeDatabase();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(authRoutes);
app.use(taskRoutes);
app.use(teamRoutes);
app.use(tagRoutes);
app.use(reportRoutes);
app.use(projectRoutes);
app.use(memberRoutes);

app.listen(4000, () => {
  console.log("Server is running on PORT 4000");
});
