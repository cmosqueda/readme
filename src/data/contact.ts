import type { IconKey } from "../lib/iconRegistry";

export const contactLinks: { id: string; platform: string; iconKey: IconKey; value: string; link: string; label: string }[] = [
  {
    id: "01",
    platform: "Email",
    iconKey: "email",
    value: "mosqueda.christinereisa04@gmail.com", // Replace with your actual email
    link: "mailto:mosqueda.christinereisa04@gmail.com",
    label: "Direct Line",
  },
  {
    id: "02",
    platform: "LinkedIn",
    iconKey: "linkedin",
    value: "Christine Mosqueda", // Replace with your actual link
    link: "https://www.linkedin.com/in/christine-mosqueda-ba202b333/",
    label: "Professional Network",
  },
  {
    id: "03",
    platform: "GitHub",
    iconKey: "github",
    value: "cmosqueda", // Replace with your actual link
    link: "https://github.com/cmosqueda",
    label: "Version Control",
  },
];
