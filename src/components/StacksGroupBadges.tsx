const stacks = [
  { name: "Python", url: "https://img.shields.io/badge/Python-3776AB?style=plastic&logo=python&logoColor=white" },
  { name: "HTML", url: "https://img.shields.io/badge/HTML5-E34F26?style=plastic&logo=html5&logoColor=white" },
  { name: "CSS", url: "https://img.shields.io/badge/CSS3-1572B6?style=plastic&logo=css3&logoColor=white" },
  {
    name: "JavaScript",
    url: "https://img.shields.io/badge/JavaScript-F7DF1E?style=plastic&logo=javascript&logoColor=black",
  },
  {
    name: "TypeScript",
    url: "https://img.shields.io/badge/TypeScript-007ACC?style=plastic&logo=typescript&logoColor=white",
  },
  { name: "JSON", url: "https://img.shields.io/badge/JSON-000000?style=plastic&logo=json&logoColor=white" },
  { name: "Node.js", url: "https://img.shields.io/badge/Node.js-339933?style=plastic&logo=nodedotjs&logoColor=white" },
  { name: "npm", url: "https://img.shields.io/badge/npm-CB3837?style=plastic&logo=npm&logoColor=white" },
  {
    name: "TailwindCSS",
    url: "https://img.shields.io/badge/TailwindCSS-06B6D4?style=plastic&logo=tailwindcss&logoColor=white",
  },
  { name: "React", url: "https://img.shields.io/badge/React-20232A?style=plastic&logo=react&logoColor=61DAFB" },
  { name: "Vite", url: "https://img.shields.io/badge/Vite-646CFF?style=plastic&logo=vite&logoColor=white" },
  { name: "Expo", url: "https://img.shields.io/badge/Expo-000020?style=plastic&logo=expo&logoColor=white" },
  { name: "Django", url: "https://img.shields.io/badge/Django-092E20?style=plastic&logo=django&logoColor=white" },
  { name: "Firebase", url: "https://img.shields.io/badge/Firebase-FFCA28?style=plastic&logo=firebase&logoColor=black" },
  {
    name: "PostgreSQL",
    url: "https://img.shields.io/badge/PostgreSQL-4169E1?style=plastic&logo=postgresql&logoColor=white",
  },
  { name: "SQLite", url: "https://img.shields.io/badge/SQLite-003B57?style=plastic&logo=sqlite&logoColor=white" },
  { name: "MySQL", url: "https://img.shields.io/badge/MySQL-4479A1?style=plastic&logo=mysql&logoColor=white" },
  { name: "Git", url: "https://img.shields.io/badge/Git-F05032?style=plastic&logo=git&logoColor=white" },
  { name: "GitHub", url: "https://img.shields.io/badge/GitHub-181717?style=plastic&logo=github&logoColor=white" },
  { name: "Axios", url: "https://img.shields.io/badge/Axios-5A29E4?style=plastic&logo=axios&logoColor=white" },
  { name: "Markdown", url: "https://img.shields.io/badge/Markdown-000000?style=plastic&logo=markdown&logoColor=white" },
  {
    name: "Drizzle ORM",
    url: "https://img.shields.io/badge/Drizzle%20ORM-8B5CF6?style=plastic&logo=drizzle&logoColor=white",
  },
  { name: "Nodemon", url: "https://img.shields.io/badge/Nodemon-76D04B?style=plastic&logo=nodemon&logoColor=white" },
  {
    name: "Docusaurus",
    url: "https://img.shields.io/badge/Docusaurus-2B3137?style=plastic&logo=docusaurus&logoColor=white",
  },
  {
    name: "Express.js",
    url: "https://img.shields.io/badge/Express.js-000000?style=plastic&logo=express&logoColor=white",
  },
  { name: "Jest", url: "https://img.shields.io/badge/Jest-99425b?style=plastic&logo=jest&logoColor=white" },
  { name: "Postman", url: "https://img.shields.io/badge/Postman-FF6C37?style=plastic&logo=postman&logoColor=white" },
  { name: "Figma", url: "https://img.shields.io/badge/Figma-F24E1E?style=plastic&logo=figma&logoColor=white" },
  { name: "Canva", url: "https://img.shields.io/badge/Canva-00C4CC?style=plastic&logo=canva&logoColor=white" },
  { name: "Kittl", url: "https://img.shields.io/badge/Kittl-6A4C93?style=plastic&logoColor=white" },
  {
    name: "Infinite Painter",
    url: "https://img.shields.io/badge/Infinite%20Painter-D72C2C?style=plastic&logoColor=white",
  },
  {
    name: "AppSheets",
    url: "https://img.shields.io/badge/AppSheets-0052CC?style=plastic&logo=appsheet&logoColor=white",
  },
  { name: "Trello", url: "https://img.shields.io/badge/Trello-0052CC?style=plastic&logo=trello&logoColor=white" },
  { name: "Miro", url: "https://img.shields.io/badge/Miro-FF2D20?style=plastic&logo=miro&logoColor=white" },
  { name: "Jupyter", url: "https://img.shields.io/badge/Jupyter-F37626?style=plastic&logo=jupyter&logoColor=white" },
];

export default function StacksGroupBadges() {
  return (
    <>
      <div className="flex flex-row flex-wrap gap-1">
        {stacks.map((stack) => (
          <img key={stack.name} src={stack.url} alt={stack.name} title={stack.name} className="" />
        ))}
      </div>
    </>
  );
}
