import ContactsGroupBadges from "./components/ContactsGroupBadges";
import StacksGroupBadges from "./components/StacksGroupBadges";

function App() {
  return (
    <>
      <div className="w-full h-full flex flex-wrap justify-center bg-gray-900">
        <div className="w-11/12 sm:w-9/12 flex flex-col gap-5 m-5 py-5 px-5 rounded-sm text-white border border-white/25">
          <a
            href="https://github.com/cmosqueda/cmosqueda"
            target="_blank"
            className="text-xs opacity-70 hover:opacity-100 w-fit"
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
                <p className="italic text-sm ">A tech enthusiast and art hobbyist</p>
              </div>
              <ul className="list-disc list-inside px-5 text-sm">
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
      </div>
    </>
  );
}

export default App;
