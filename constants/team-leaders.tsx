interface TeamLeader {
  name: string;
  team: string;
  phoneNumber: string;
  telegram: string;
  image: string;
  bio: string;
}

export const TEAM_LEADERS: TeamLeader[] = [
  {
    name: "Mihretab",
    team: "Prayer",
    phoneNumber: "+251912345678",
    telegram: "@natnael_prayer",
    image: "https://source.unsplash.com/random/200x200?man,prayer",
    bio: "Dedicated to leading the prayer team and inspiring the youth to grow deeper in faith through consistent prayer and spiritual discipline.",
  },
  {
    name: "Yeabets",
    team: "Worship",
    phoneNumber: "+251911234567",
    telegram: "@kefa_worship",
    image: "https://source.unsplash.com/random/200x200?man,music",
    bio: "Focused on creating an atmosphere of worship and praise, guiding the team to serve with excellence.",
  },
  {
    name: "Nathan",
    team: "Media",
    phoneNumber: "+251910123456",
    telegram: "@dibora_youth",
    image: "https://source.unsplash.com/random/200x200?man,camera",
    bio: "Passionate about media and storytelling, ensuring the fellowship’s message reaches everyone effectively.",
  },
  {
    name: "Muse",
    team: "Bible Study",
    phoneNumber: "+251919876543",
    telegram: "@nahom_finance",
    image: "https://source.unsplash.com/random/200x200?man,books",
    bio: "Committed to facilitating Bible study sessions that nurture spiritual growth and understanding.",
  },
  {
    name: "Desalegn",
    team: "I4U",
    phoneNumber: "+251918765432",
    telegram: "@desu",
    image: "https://source.unsplash.com/random/200x200?man,student",
    bio: "4th year Physics student and fellowship coordinator, committed to leading with wisdom and strengthening the fellowship through service and unity.",
  },
  {
    name: "Natnael",
    team: "Freshman",
    phoneNumber: "+251917654321",
    telegram: "@kidist_writer",
    image: "https://source.unsplash.com/random/200x200?man,young",
    bio: "Creating and sharing meaningful content to inspire, educate, and uplift the fellowship through written communication.",
  },
  {
    name: "Robel",
    team: "Evangelism",
    phoneNumber: "+251916543210",
    telegram: "@robi_evangelism",
    image: "https://source.unsplash.com/random/200x200?man,community",
    bio: "Passionate about spreading the gospel and mobilizing others to engage in evangelism and community outreach.",
  },
];

export default TEAM_LEADERS;
