import GitHubCalendar from "react-github-calendar";
import ContactsGroupBadges from "./components/ContactsGroupBadges";
import ProjectsGroupBar from "./components/ProjectsGroupBar";
import StacksGroupBadges from "./components/StacksGroupBadges";

function App() {
  return (
    <>
      <div className="w-full h-full flex flex-wrap gap-8 py-10 justify-center bg-gray-900">
        {/* readme layout section */}
        <div className="w-11/12 sm:w-9/12 flex flex-col gap-5 p-5 rounded-sm text-white border border-white/25">
          <a
            href="https://github.com/cmosqueda/cmosqueda"
            target="_blank"
            className="text-xs opacity-70 hover:opacity-100 w-fit monosans-text"
          >
            cmosqueda/README.md
          </a>
          {/* header img */}
          <img
            src="https://i.pinimg.com/originals/87/ff/80/87ff8095ec6f77e2c84e9564654ed615.gif"
            className="h-[300px] object-cover"
          ></img>

          {/* about text and gif */}
          <div className="flex flex-col items-center sm:flex-row  justify-between">
            {/* text - about */}
            <div className="flex flex-col gap-3">
              <p className="font-bold text-3xl">👋 Hi, I'm Tyne!</p>
              <hr className="opacity-20" />
              <div className="w-fit bg-gray-700 px-2 border border-white/30 rounded-sm">
                <p className="text-sm monosans-text">A tech enthusiast and art hobbyist</p>
              </div>
              <ul className="list-disc px-5 text-sm">
                <li>Studying BSIT at USTP-CDO</li>
                <li>I draw, write, and consume pop culture content in my idle time</li>
                <li>I like FNaF, Harry Potter, and Kpop</li>
              </ul>
            </div>

            {/* gif */}
            <img
              src="https://static.wikia.nocookie.net/freddy-fazbears-pizzeria-simulator/images/3/37/HelpyCRACK.gif"
              className="w-fit"
            ></img>
          </div>

          {/* contacts */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">🗨️ Let's Talk!</p>

            {/* contacts badges */}
            <ContactsGroupBadges></ContactsGroupBadges>
          </div>

          {/* stacks badges */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">👩‍💻 Stacks</p>
            {/* badges */}
            <StacksGroupBadges></StacksGroupBadges>
          </div>
        </div>

        {/* projects section*/}
        <div className="w-11/12 sm:w-9/12 flex flex-col gap-4 text-white">
          <p className="font-bold">Projects</p>

          {/* projects components*/}
          <ProjectsGroupBar></ProjectsGroupBar>
        </div>

        {/* github contributions */}
        <div className="w-11/12 sm:w-9/12 text-white flex flex-col gap-4">
          <p>@cmosqueda on GitHub</p>
          <div className="border border-white/25 w-full overflow-auto p-5 rounded-sm">
            <GitHubCalendar username="cmosqueda" colorScheme="dark" showWeekdayLabels></GitHubCalendar>
          </div>
        </div>

        {/* murag footer */}
        <p className="w-11/12 sm:w-9/12 text-center monosans-text text-xs text-white">
          site by tyne. all rights reserved.
        </p>
      </div>
    </>
  );
}

export default App;
