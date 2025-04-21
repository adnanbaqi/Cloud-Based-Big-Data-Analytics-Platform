import * as dotenv from "dotenv";
dotenv.config();
import { KafkaHandler } from "./kafka-handler";
import { ingestCatalogToRedis, getStarObjectByKey } from "./redis-data-handler";
import { Star } from "./starInterface";

const MESSAGES_PER_MIN = 20;
const MILISECONDS_IN_MIN = 60000;
const DELAY = MILISECONDS_IN_MIN / MESSAGES_PER_MIN;
let numberOfStars = 0;

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

const getRandomEventSourceEnumValue = () => {
  const eventSources = Object.keys(EventSource);
  const randomIndex = Math.floor(Math.random() * eventSources.length);
  const randomEnumValue = eventSources[randomIndex];
  return randomEnumValue;
};

const getRandomEventTypeEnumValue = () => {
  const eventSources = Object.keys(EventType);
  const randomIndex = Math.floor(Math.random() * eventSources.length);
  const randomEnumValue = eventSources[randomIndex];
  return randomEnumValue;
};

const getRandomNumberByMaxVal = (maxVal: number) => {
  return Math.floor(Math.random() * maxVal);
};

const generateValidDEC = () => {
  const minDEC = -90;
  const maxDEC = 90;

  // Generate a random number between -90 and 90 (inclusive)
  const randomDEC = Math.floor(Math.random() * (maxDEC - minDEC + 1)) + minDEC;

  return randomDEC;
};

class CosmicEvent {
  eventTS: number;
  eventSource: string;
  ra: RALocationUnits;
  dec: DECLocationUnits;
  eventType: string;
  title: string;
  urgency: number;

  constructor(urgency: number, starData: Star) {
    const { "RA PM": ra_pm, "DEC PM": dec_pm, DEC, RA , "Title HD": title} = starData;
    this.ra = {
      ra_pm,
      ra_val: RA,
    };
    this.dec = {
      dec_pm,
      dec_val: DEC,
    };
    this.eventType = getRandomEventTypeEnumValue();
    this.eventSource = getRandomEventSourceEnumValue();
    this.urgency = urgency;
    this.eventTS = new Date().getTime();
    this.title = title
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  numberOfStars = await ingestCatalogToRedis();
  console.log(
    `Sending ${MESSAGES_PER_MIN} messages per min, Delay between each message in MS: ${DELAY}`
  );
  const kafkaHandler = new KafkaHandler();
  await kafkaHandler.connectKafka();

  let eventCounter = 0;
  let eventToPublish;
  console.log("starting to generate events");

  while (true) {
    let priority = getRandomNumberByMaxVal(3);
    const starData: Star = await getStarObjectByKey(
      getRandomNumberByMaxVal(numberOfStars)
    );

    if (eventCounter % 10 === 0) {
      eventToPublish = new CosmicEvent(3, starData);
    }

    if (eventCounter % 1000 === 0) {
      eventToPublish = new CosmicEvent(4, starData);
    }

    if (eventCounter % 10000 === 0) {
      eventToPublish = new CosmicEvent(5, starData);
    }

    if (eventToPublish === undefined) {
      eventToPublish = new CosmicEvent(priority, starData);
    }

    let messageAsString = JSON.stringify(eventToPublish);
    await kafkaHandler.sendMessage({
      key: new Date().getTime().toString(),
      value: messageAsString,
    });
    eventCounter++;
    eventToPublish = undefined;
    await sleep(DELAY);
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(`ERROR OCCURED!!: ${e}`);
  });
