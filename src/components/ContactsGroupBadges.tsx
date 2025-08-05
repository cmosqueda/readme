export default function ContactsGroupBadges() {
  return (
    <>
      {/* badges */}
      <div className="flex flex-row flex-wrap gap-1">
        {/* gmail */}
        <a href="mailto:mosqueda.christinereisa04@gmail.com" target="_blank">
          <img
            src="https://img.shields.io/badge/Gmail-Email%20Me-D14836?style=plastic&labelColor=000000&logo=gmail&logoColor=white"
            alt="gmail"
          />
        </a>

        {/* facebook */}
        <a href="https://facebook.com/christine.mosqueda.395" target="_blank">
          <img
            src="https://img.shields.io/badge/Facebook-Chat-1877F2?style=plastic&labelColor=000000&logo=facebook&logoColor=white"
            alt="facebook"
          />
        </a>

        {/* linked in */}
        <a href="https://linkedin.com/in/christine-mosqueda-ba202b333" target="_blank">
          <img
            src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=plastic&labelColor=000000&logo=linkedin&logoColor=white"
            alt="linkedin"
          />
        </a>
      </div>
    </>
  );
}
