import { Program } from "@/types";

export type { Program };

export const WEEKLY_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    title: "Monday General Service",
    description:
      "Our flagship weekly fellowship gathering featuring deep corporate worship, spiritual impartation, anointed scripture exposition, and communal intercession for all campus students.",
    day: "Monday",
    time: "5:15 PM - 8:00 PM",
    category: "General Fellowship",
    location: "Hibret Amba Kale Heywet Church",
    coordinates: { lat: 9.038952, lng: 38.758315 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908638/programs/program-monday1.jpg",
  },
  {
    id: "prog-2",
    title: "Daily Morning Prayer",
    description:
      "Start your weekday morning aligned with God's presence through quiet intercession, scripture reading, and seeking guidance for studies and personal walk before lectures commence.",
    day: "Monday - Friday",
    time: "6:30 AM - 7:30 AM",
    category: "Prayer",
    location: "Anglican Church",
    coordinates: { lat: 9.033291, lng: 38.76878 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908639/programs/program-wed.jpg",
  },
  {
    id: "prog-3",
    title: "Fresh Batch Fellowship",
    description:
      "A vibrant discipleship community dedicated to freshman students, offering warm guidance, elder sibling mentoring, spiritual foundations, and campus orientation.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Fresh",
    location: "Anglican Church",
    coordinates: { lat: 9.033291, lng: 38.76878 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908632/programs/program-fresh.jpg",
  },
  {
    id: "prog-4",
    title: "Worship Team Rehearsal",
    description:
      "Spiritual and musical preparation session for vocalists, instrumentalists, and sound ministers to build unified heartfelt praise and usher the fellowship into worship.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Ministry",
    location: "Hibret Amba Kale Heywet Church",
    coordinates: { lat: 9.038952, lng: 38.758315 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908642/programs/program-wer.jpg",
  },
  {
    id: "prog-5",
    title: "Bible & Manuscript Study",
    description:
      "Inductive Bible study examining scriptures verse by verse with rigorous historical context, practical theological reflection, and Christ-centered application.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Teaching",
    location: "6 Kilo Church",
    coordinates: { lat: 9.040463, lng: 38.75974 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908629/programs/program-bss.jpg",
  },
  {
    id: "prog-6",
    title: "Media & Production Team",
    description:
      "Technical stewardship team handling audio engineering, multimedia graphics, photography, live streaming, and social channels for all fellowship events.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Service",
    location: "6 Kilo Church",
    coordinates: { lat: 9.040463, lng: 38.75974 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908635/programs/program-image.jpg",
  },
  {
    id: "prog-7",
    title: "Evangelism Outreach & Campus Walk",
    description:
      "Sharing the Gospel of Jesus Christ across dormitories, campus courtyards, and local streets through intentional conversations, tracts, and caring prayer.",
    day: "Thursday",
    time: "5:00 PM - 7:00 PM",
    category: "Outreach",
    location: "Hibret Amba Meeting Point",
    coordinates: { lat: 9.038952, lng: 38.758315 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908630/programs/program-evan.jpg",
  },
  {
    id: "prog-8",
    title: "I4U: Identity & Life Fellowship",
    description:
      "Interactive life group addressing Christian identity in academia, career callings, mental wellness, relationships, and standing firm in contemporary culture.",
    day: "Wednesday",
    time: "5:30 PM - 7:30 PM",
    category: "Fellowship",
    location: "Emmanuel Church",
    coordinates: { lat: 9.030377, lng: 38.77197 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908634/programs/program-i4u.jpg",
  },
  {
    id: "prog-9",
    title: "Prayer & Intercession Team",
    description:
      "Focused spiritual warfare and intercession lifting up the university campus, Christian students, national revivals, and personal member prayer requests.",
    day: "Thursday",
    time: "5:30 PM - 7:30 PM",
    category: "Prayer",
    location: "Emmanuel Church",
    coordinates: { lat: 9.030377, lng: 38.77197 },
    image:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793908636/programs/program-image2.jpg",
  },
];
