import { Ionicons } from "@expo/vector-icons";

export type TeamLeader = {
  name: string;
  role: string;
  image: string;
  telegram: string;
  phone: string;
};

export type Team = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  members: string;
  description: string;
  about: string;
  day: string;
  time: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  image: any;
  leader: TeamLeader;
};

export const TEAMS: Team[] = [
  {
    id: "1",
    name: "Evangelism Team",
    icon: "megaphone",
    color: "#059669",
    members: "50",
    description: "Reaching out to the community with the message of Christ.",
    about:
      "The Evangelism Team is passionate about sharing the Gospel and making disciples. We believe that every believer is called to be a witness for Christ, and our team equips and empowers members to share their faith boldly and compassionately. Through campus outreach, community events, and personal evangelism, we seek to reach the lost and bring them into a relationship with Jesus Christ. Our team creates opportunities for members to step out of their comfort zones and experience the joy of leading others to Christ. We organize weekly outreach programs, training sessions, and prayer walks to engage with students and community members who need to hear the good news.",
    day: "Thursday",
    time: "5:30 PM - 7:30 PM",
    category: "Outreach",
    location: "Hibret Amba",
    coordinates: { lat: 9.038952250154978, lng: 38.75831542801892 },
    image: require("@/assets/images/programs/evan.png"),
    leader: {
      name: "Robi",
      role: "Evangelism Team Leader",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      telegram: "@robi",
      phone: "+251 911 234 567",
    },
  },
  {
    id: "2",
    name: "Bible Study Team",
    icon: "book",
    color: "#7c3aed",
    members: "35",
    description: "Teaching and studying God's word to strengthen believers.",
    about:
      "The Bible Study Team is dedicated to helping believers grow deeper in their understanding of God's Word. We believe that spiritual maturity comes through consistent study and application of Scripture. Our team facilitates engaging Bible studies that encourage discussion, critical thinking, and practical application. We explore various books of the Bible, theological topics, and relevant life issues through the lens of Scripture. Our sessions are designed to be interactive and welcoming for both new believers and mature Christians. We emphasize the importance of personal devotion and provide resources and guidance for developing a consistent quiet time. Through systematic teaching and small group discussions, we help members develop strong biblical foundations.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Teaching",
    location: "6kilo church",
    coordinates: { lat: 9.040462923318069, lng: 38.759740033794586 },
    image: require("@/assets/images/programs/bss.jpg"),
    leader: {
      name: "Muse Lema",
      role: "Bible Study Coordinator",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      telegram: "@ruth_alemayehu",
      phone: "+251 912 345 678",
    },
  },
  {
    id: "3",
    name: "Worship Team",
    icon: "musical-notes",
    color: "#0ea5e9",
    members: "45",
    description: "A dedicated team leading the church in praise and worship.",
    about:
      "The Worship Team exists to usher the congregation into the presence of God through music and song. We believe that worship is not just about music, but about creating an atmosphere where hearts can connect with God. Our team consists of vocalists, instrumentalists, and technical crew who work together to create meaningful worship experiences. We practice regularly to ensure excellence in our musical presentation while maintaining a heart of worship. Beyond Sunday services, we lead worship at special events, prayer meetings, and outreach programs. We also provide training for aspiring worship leaders and musicians, helping them develop their gifts while keeping their focus on glorifying God. Our team values authenticity, excellence, and a genuine passion for leading others into God's presence.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Ministry",
    location: "Hibret Amba",
    coordinates: { lat: 9.038952250154978, lng: 38.75831542801892 },
    image: require("@/assets/images/programs/wer.png"),
    leader: {
      name: "Salem Bekele",
      role: "Worship Leader",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      telegram: "@samuel_bekele",
      phone: "+251 913 456 789",
    },
  },
  {
    id: "4",
    name: "I4U Team",
    icon: "heart",
    color: "#db2777",
    members: "28",
    description:
      "A fellowship focused on identity, faith, and unity in Christ.",
    about:
      "The I4U (Identity For You) Team is committed to helping young believers discover and embrace their identity in Christ. In a world that constantly tries to define who we are, we anchor our identity in what God says about us. Our team creates a safe space for honest conversations about faith, purpose, relationships, and the challenges of living as a Christian in today's culture. We organize fellowship events, mentorship programs, and discussion groups that address real-life issues from a biblical perspective. Through authentic community and biblical teaching, we help members understand their worth, purpose, and calling in Christ. We emphasize the importance of unity in diversity, celebrating our differences while remaining united in our faith. Our team is passionate about building strong, Christ-centered friendships that last beyond university years.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Fellowship",
    location: "Emmanuel church",
    coordinates: { lat: 9.03037740148045, lng: 38.77196975055801 },
    image: require("@/assets/images/programs/i4u.jpg"),
    leader: {
      name: "Desalegn Tadesse",
      role: "I4U Team Coordinator",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      telegram: "@bethlehem_tadesse",
      phone: "+251 914 567 890",
    },
  },
  {
    id: "5",
    name: "Prayer Team",
    icon: "flame",
    color: "#dc2626",
    members: "40",
    description: "Interceding and praying for the church and the community.",
    about:
      "The Prayer Team is the spiritual backbone of our fellowship, committed to interceding for the church, our community, and the world. We believe that prayer is the most powerful tool we have as believers, and we take seriously the call to pray without ceasing. Our team organizes regular prayer meetings, prayer walks, and 24/7 prayer chains during special seasons. We pray for specific needs within our fellowship, for our leaders, for campus-wide spiritual awakening, and for global missions. We also provide prayer support for individuals going through difficult times and celebrate answered prayers together. Our team trains members in different prayer methods and helps them develop a consistent personal prayer life. We create an atmosphere where members can experience the power of corporate prayer and witness God's faithfulness in responding to our prayers.",
    day: "Thursday",
    time: "5:30 PM - 7:30 PM",
    category: "Prayer",
    location: "Emmanuel church",
    coordinates: { lat: 9.03037740148045, lng: 38.77196975055801 },
    image: require("@/assets/images/programs/image2.png"),
    leader: {
      name: "Dagim Amha",
      role: "Prayer Coordinator",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      telegram: "@yohannes_mulugeta",
      phone: "+251 915 678 901",
    },
  },
  {
    id: "6",
    name: "Literature and Media Team",
    icon: "videocam",
    color: "#d97706",
    members: "22",
    description: "Managing sound, visuals, and live streaming for services.",
    about:
      "The Literature and Media Team combines creativity and technology to spread the Gospel and document our fellowship's journey. We handle everything from sound and lighting during services to creating engaging social media content and producing high-quality videos. Our team believes that every sermon, worship session, and testimony deserves to be captured and shared with excellence. We manage live streaming for those who can't attend in person, create promotional materials for events, and maintain our digital presence across various platforms. Beyond technical work, we also curate and distribute Christian literature, create devotional content, and produce podcasts that encourage spiritual growth. Our team is always looking for innovative ways to use media and technology to advance the Kingdom and reach the digital generation with the timeless message of the Gospel.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Service",
    location: "6kilo church",
    coordinates: { lat: 9.040462923318069, lng: 38.759740033794586 },
    image: require("@/assets/images/programs/image.png"),
    leader: {
      name: "Dibora Eyasu",
      role: "Media Director",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      telegram: "@meron_haile",
      phone: "+251 916 789 012",
    },
  },
  {
    id: "7",
    name: "Freshman",
    icon: "school",
    color: "#84cc16",
    members: "65",
    description:
      "A vibrant gathering for 1st year students to connect and grow in faith.",
    about:
      "The Freshman Team is specifically designed to welcome and integrate first-year students into our fellowship community. We understand that starting university can be overwhelming, and we're here to provide spiritual support, friendship, and guidance during this crucial transition. Our team creates a warm, inclusive environment where freshmen can ask questions, make friends, and grow in their faith without feeling intimidated. We organize orientation sessions, social events, study groups, and mentorship programs that help new students navigate both academic and spiritual life. We emphasize building strong foundations in faith, developing healthy habits, and connecting with older students who can provide guidance and support. Our goal is to ensure that every freshman feels valued, supported, and equipped to thrive spiritually throughout their university journey and beyond.",
    day: "Wednesday",
    time: "5:30 PM - 2:00 PM",
    category: "Fresh",
    location: "Anglican Church",
    coordinates: { lat: 9.033291325771401, lng: 38.76877997143855 },
    image: require("@/assets/images/programs/fresh.png"),
    leader: {
      name: "Natnale Zerihun",
      role: "Freshman Coordinator",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      telegram: "@abigail_girma",
      phone: "+251 917 890 123",
    },
  },
];

// Simple array of team names for dropdowns/forms
export const TEAM_NAMES = [
  "Evangelism Team",
  "Bible Study Team",
  "Worship Team",
  "I4U Team",
  "Prayer Team",
  "Literature and Media Team",
  "Freshman",
  "Other",
];
