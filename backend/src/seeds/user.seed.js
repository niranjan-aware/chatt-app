import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "emma.thompson@example.com",
    username: "Emma Thompson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    username: "Olivia Miller",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    username: "Sophia Davis",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "ava.wilson@example.com",
    username: "Ava Wilson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "isabella.brown@example.com",
    username: "Isabella Brown",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "mia.johnson@example.com",
    username: "Mia Johnson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "charlotte.williams@example.com",
    username: "Charlotte Williams",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    email: "amelia.garcia@example.com",
    username: "Amelia Garcia",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Male Users
  {
    email: "james.anderson@example.com",
    username: "James Anderson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "william.clark@example.com",
    username: "William Clark",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "benjamin.taylor@example.com",
    username: "Benjamin Taylor",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "lucas.moore@example.com",
    username: "Lucas Moore",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "henry.jackson@example.com",
    username: "Henry Jackson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "alexander.martin@example.com",
    username: "Alexander Martin",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "daniel.rodriguez@example.com",
    username: "Daniel Rodriguez",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },{
    email: "priya.sharma@example.in",
    username: "Priya Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    email: "ananya.iyer@example.in",
    username: "Ananya Iyer",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/66.jpg",
  },
  {
    email: "sneha.patel@example.in",
    username: "Sneha Patel",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/67.jpg",
  },
  {
    email: "kavya.verma@example.in",
    username: "Kavya Verma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    email: "rahul.mehra@example.in",
    username: "Rahul Mehra",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    email: "arjun.kumar@example.in",
    username: "Arjun Kumar",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/66.jpg",
  },
  {
    email: "rohit.singh@example.in",
    username: "Rohit Singh",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    email: "amit.desai@example.in",
    username: "Amit Desai",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/68.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
