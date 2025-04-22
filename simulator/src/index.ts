interface Star {
  RA: string;
  DEC: string;
  "RA PM": string;
  "DEC PM": string;
  "Title HD": string;
}

interface RALocationUnits {
  ra_val: string;
  ra_pm: string;
}
interface DECLocationUnits {
  dec_val: string;
  dec_pm: string;
}

enum EventType {
  GRB = "GRB",
  ApparentBrightnessRise = "Apparent Brightness Rise",
  UVRise = "UV Rise",
  XRayRise = "XRay Rise",
  Comet = "Comet",
}

enum EventSource {
  MMT = "MMT",
  GeminiObservatoryTelescopes = "Gemini Observatory Telescopes",
  VLT = "Very Large Telescope",
  SubaruTelescope = "Subaru Telescope",
  LBT = "Large Binocular Telescope",
  SALT = "Southern African Large Telescope",
  HET = "Hobby-Eberly Telescope",
  GranTeCan = "Gran Telescopio Canarias",
  GMT = "The Giant Magellan Telescope",
  TMT = "Thirty Meter Telescope",
  ELT = "European Extremely Large Telescope",
}

const getRandomEnumValue = <T extends object>(enumObj: T): string => {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)] as string;
};

const getRandomNumber = (maxVal: number): number =>
  Math.floor(Math.random() * maxVal);

class CosmicEvent {
  eventTS: number;
  eventSource: string;
  ra: RALocationUnits;
  dec: DECLocationUnits;
  eventType: string;
  title: string;
  urgency: number;

  constructor(urgency: number, starData: Star) {
    const { "RA PM": ra_pm, "DEC PM": dec_pm, DEC, RA, "Title HD": title } = starData;
    this.ra = { ra_pm, ra_val: RA };
    this.dec = { dec_pm, dec_val: DEC };
    this.eventType = getRandomEnumValue(EventType);
    this.eventSource = getRandomEnumValue(EventSource);
    this.urgency = urgency;
    this.eventTS = Date.now();
    this.title = title;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MESSAGES_PER_MIN = 20;
const DELAY = 60000 / MESSAGES_PER_MIN;

// ----- MOCKED ElasticSearch & GCP Star Data -----
const mockElasticData: Star[] = [
  { RA: "13.45", DEC: "-45.6", "RA PM": "0.1", "DEC PM": "0.05", "Title HD": "HD 12345" },
  { RA: "122.22", DEC: "5.33", "RA PM": "0.2", "DEC PM": "0.1", "Title HD": "HD 45678" },
];

const mockGCPData: Star[] = [
  { RA: "203.3", DEC: "-20.5", "RA PM": "0.3", "DEC PM": "0.15", "Title HD": "HD 98765" },
  { RA: "310.1", DEC: "12.0", "RA PM": "0.25", "DEC PM": "0.2", "Title HD": "HD 11223" },
];

// ----- MOCK Kafka -----
const mockKafkaSend = async (message: { key: string; value: string }) => {
  console.log("Kafka Published:", message);
};

const main = async () => {
  console.log(`Sending ${MESSAGES_PER_MIN} messages per min. Delay: ${DELAY}ms`);
  console.log("Starting event generation...");

  let eventCounter = 0;

  while (true) {
    const useElastic = Math.random() > 0.5;
    const starData: Star = useElastic
      ? mockElasticData[getRandomNumber(mockElasticData.length)]
      : mockGCPData[getRandomNumber(mockGCPData.length)];

    const priority =
      eventCounter % 10000 === 0
        ? 5
        : eventCounter % 1000 === 0
        ? 4
        : eventCounter % 10 === 0
        ? 3
        : getRandomNumber(3);

    const eventToPublish = new CosmicEvent(priority, starData);
    const message = {
      key: Date.now().toString(),
      value: JSON.stringify(eventToPublish),
    };

    await mockKafkaSend(message);
    eventCounter++;
    await sleep(DELAY);
  }
};

main().catch((err) => console.error("ERROR:", err));
