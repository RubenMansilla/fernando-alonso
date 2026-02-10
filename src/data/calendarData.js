import flagAbuDabi from "../assets/flags/flag-Abu-Dabi.svg";
import flagAustralia from "../assets/flags/flag-Australia.svg";
import flagAustria from "../assets/flags/flag-Austria.svg";
import flagAzerbaijan from "../assets/flags/flag-Azerbaijan.svg";
import flagBahrain from "../assets/flags/flag-Bahrain.svg";
import flagBelgium from "../assets/flags/flag-Belgium.svg";
import flagBrazil from "../assets/flags/flag-Brazil.png";
import flagCanada from "../assets/flags/flag-Canada.svg";
import flagChina from "../assets/flags/flag-China.svg";
import flagHungary from "../assets/flags/flag-Hungary.svg";
import flagItaly from "../assets/flags/flag-Italy.svg";
import flagJapan from "../assets/flags/flag-Japan.svg";
import flagMexico from "../assets/flags/flag-Mexico.png";
import flagMonaco from "../assets/flags/flag-Monaco.svg";
import flagNetherlands from "../assets/flags/flag-Netherlands.svg";
import flagQatar from "../assets/flags/flag-Qatar.svg";
import flagSaudiArabia from "../assets/flags/flag-Saudi-Arabia.svg";
import flagSingapore from "../assets/flags/flag-Singapore.svg";
import flagSpain from "../assets/flags/flag-Spain.png";
import flagUK from "../assets/flags/flag-UK.svg";
import flagUSA from "../assets/flags/flag-USA.svg";

export const calendarSourceData = [
    { round: "01", location: "Australia", dates: "06-08 Mar", laps: 58, distance: "306.124" },
    { round: "02", location: "China", dates: "13-15 Mar", laps: 56, distance: "305.256" },
    { round: "03", location: "Japan", dates: "27-29 Mar", laps: 53, distance: "307.771" },
    { round: "04", location: "Bahrain", dates: "10-12 Apr", laps: 57, distance: "308.484" },
    { round: "05", location: "Saudi Arabia", dates: "17-19 Apr", laps: 50, distance: "308.700" },
    { round: "06", location: "Miami", dates: "01-03 May", laps: 57, distance: "308.484" },
    { round: "07", location: "Canada", dates: "22-24 May", laps: 70, distance: "305.270" },
    { round: "08", location: "Monaco", dates: "05-07 Jun", laps: 78, distance: "260.286" },
    { round: "09", location: "Spain", dates: "12-14 Jun", laps: 66, distance: "307.362" },
    { round: "10", location: "Austria", dates: "26-28 Jun", laps: 71, distance: "306.578" },
    { round: "11", location: "United Kingdom", dates: "03-05 Jul", laps: 52, distance: "306.332" },
    { round: "12", location: "Belgium", dates: "17-19 Jul", laps: 44, distance: "308.176" },
    { round: "13", location: "Hungary", dates: "24-26 Jul", laps: 70, distance: "306.670" },
    { round: "14", location: "Netherlands", dates: "21-23 Aug", laps: 72, distance: "306.648" },
    { round: "15", location: "Italy", dates: "04-06 Sep", laps: 53, distance: "307.029" },
    { round: "16", location: "Spain", dates: "11-13 Sep", laps: 57, distance: "312.018" },
    { round: "17", location: "Azerbaijan", dates: "24-26 Sep", laps: 51, distance: "306.153" },
    { round: "18", location: "Singapore", dates: "09-11 Oct", laps: 62, distance: "306.280" },
    { round: "19", location: "United States", dates: "23-25 Oct", laps: 56, distance: "308.728" },
    { round: "20", location: "Mexico", dates: "30-01 Nov", laps: 71, distance: "305.584" },
    { round: "21", location: "Brazil", dates: "06-08 Nov", laps: 71, distance: "305.939" },
    { round: "22", location: "Las Vegas", dates: "19-21 Nov", laps: 50, distance: "310.050" },
    { round: "23", location: "Qatar", dates: "27-29 Nov", laps: 57, distance: "308.883" },
    { round: "24", location: "Abu Dhabi", dates: "04-06 Dec", laps: 58, distance: "306.298" },
];

export const LOCATION_TO_KEY = {
    Australia: "melbourne",
    China: "shanghai",
    Japan: "suzuka",
    Bahrain: "sakhir",
    "Saudi Arabia": "jeddah",
    Miami: "miami",
    Canada: "montreal",
    Monaco: "monaco",
    Spain: "barcelona",
    Austria: "speilberg",
    "United Kingdom": "silverstone",
    Belgium: "spa-francorchamps",
    Hungary: "mogyorod",
    Netherlands: "zandvoort",
    Italy: "monza",
    Azerbaijan: "baku",
    Singapore: "singapore",
    "United States": "austin",
    Mexico: "mexico-city",
    Brazil: "sao-paulo",
    "Las Vegas": "las-vegas",
    Qatar: "lusail",
    "Abu Dhabi": "yas-marina",
};

export const FLAGS = {
    melbourne: flagAustralia,
    shanghai: flagChina,
    suzuka: flagJapan,
    sakhir: flagBahrain,
    jeddah: flagSaudiArabia,
    miami: flagUSA,
    montreal: flagCanada,
    monaco: flagMonaco,
    barcelona: flagSpain,
    speilberg: flagAustria,
    silverstone: flagUK,
    "spa-francorchamps": flagBelgium,
    mogyorod: flagHungary,
    zandvoort: flagNetherlands,
    monza: flagItaly,
    baku: flagAzerbaijan,
    singapore: flagSingapore,
    austin: flagUSA,
    "mexico-city": flagMexico,
    "sao-paulo": flagBrazil,
    "las-vegas": flagUSA,
    lusail: flagQatar,
    "yas-marina": flagAbuDabi,
};
