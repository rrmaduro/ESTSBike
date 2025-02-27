import express from "express";
import bodyParser from "body-parser";
import cors from "cors"; // Import cors middleware

// Import your route handlers
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEventById,
  deleteEventById
} from "./routes/EventRoutes.js";

import {
  getAllEventTypes,
  getEventTypeById,
  createEventType,
  updateEventTypeById,
  deleteEventTypeById
} from "./routes/EventTypesRoutes.js";

import {
  getMembers,
  getMember,
  createMember,
  updateMemberInfo,
  deleteMemberById
} from "./routes/MemberRoutes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type"
}));

app.use(bodyParser.json()); 

app.get("/events", getAllEvents);
app.get("/events/:id", getEventById);
app.post("/events", createEvent);
app.put("/events/:id", updateEventById);
app.delete("/events/:id", deleteEventById);

app.get("/event-types", getAllEventTypes);
app.get("/event-types/:id", getEventTypeById);
app.post("/event-types", createEventType);
app.put("/event-types/:id", updateEventTypeById);
app.delete("/event-types/:id", deleteEventTypeById);

app.get("/members", getMembers);
app.get("/members/:id", getMember);
app.post("/members", createMember);
app.put("/members/:id", updateMemberInfo);
app.delete("/members/:id", deleteMemberById);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
