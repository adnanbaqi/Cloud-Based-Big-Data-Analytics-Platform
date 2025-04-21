import { Router } from "express";
import { Client } from "@elastic/elasticsearch";
import moment from "moment";

const router = Router();
const ELASTIC_SEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://localhost:9200";
const client = new Client({ node: ELASTIC_SEARCH_URL });

// Search by 2 date ranges
router.get("/searchByDateRange", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const response = await client.search({
      index: "stars",
      body: {
        query: {
          range: {
            eventTS: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });
    res.json(response.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/searchByObservatoryAndDate", async (req, res) => {
  const startDate = new Date(req.query.startDate).getTime();
  const endDate = new Date(req.query.endDate).getTime();
  const observatoryName = req.query.observatoryName;
  console.log("startDate : ", startDate);
  console.log("endDate : ", endDate);

  try {
    const response = await client.search({
      index: "stars",
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  eventSource: observatoryName,
                },
              },
              {
                range: {
                  eventTS: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            ],
          },
        },
      },
    });
    res.json(response.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Search by ID and 2 date ranges
router.get("/searchByIdAndDate", async (req, res) => {
  const { id, startDate, endDate } = req.query;
  const startDateTimestamp = new Date(startDate).getTime();
  const endDateTimestamp = new Date(endDate).getTime();
  console.log("id : ", id);
  console.log("startDate : ", startDateTimestamp);
  console.log("endDate : ", endDateTimestamp);

  try {
    const response = await client.search({
      index: "stars",
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  title: id,
                },
              },
              {
                range: {
                  eventTS: {
                    gte: startDateTimestamp,
                    lte: endDateTimestamp,
                  },
                },
              },
            ],
          },
        },
      },
    });
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const response = await client.count({
      index: "stars",
    });
    let totalNumber = response.body.count;

    const responseDangerous = await client.count({
      index: "stars",
      body: {
        query: {
          range: {
            urgency: { gte: 3 }, // Filter events with urgency greater than 3
          },
        },
      },
    });
    let totalDangerousNumber = responseDangerous.body.count;

    // Subtract 24 hours (in seconds) from current time
    let last24Hours = moment().subtract(24, "hours").unix() * 1000;
    console.log("last24Hours : ", last24Hours);

    // Subtract 7 days (in seconds) from current time
    let last7Days = moment().subtract(7, "days").unix() * 1000;
    console.log("last7Days : ", last7Days);

    // Number of events in the last 24 hours
    const responseLast24Hours = await client.search({
      index: "stars",
      body: {
        query: {
          range: {
            eventTS: {
              gte: last24Hours,
            },
          },
        },
      },
    });

    let totalLast24Hours = responseLast24Hours.body.hits.total.value;

    // Number of events in the last 7 days
    const responseLast7Days = await client.search({
      index: "stars",
      body: {
        query: {
          range: {
            eventTS: {
              gte: last7Days,
            },
          },
        },
      },
    });

    let totalLast7Days = responseLast7Days.body.hits.total.value;

    res.json({
      number1: totalNumber,
      number2: totalDangerousNumber,
      number3: Math.floor(totalLast24Hours * 0.5129),
      number4: totalLast7Days * 0.7439,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const fieldQueryMapping = {
  urgency: "urgency",
  title: "title.keyword",
};

router.get("/groupByField", async (req, res) => {
  const { fieldName } = req.query;
  const field = fieldQueryMapping[fieldName] ?? "urgency";

  const mapping = {};

  try {
    const responseAggregate = await client.search({
      index: "stars",
      size: 0,
      body: {
        aggs: {
          [fieldName]: {
            terms: { field },
          },
        },
      },
    });

    const {
      body: { aggregations },
    } = responseAggregate;

    for (const bucketObj of aggregations?.[fieldName]?.buckets) {
      if (bucketObj?.key !== undefined) {
        mapping[bucketObj?.key] = {
          name: `${fieldName} :${bucketObj?.key}`,
          value: bucketObj?.doc_count,
        };
      }
    }

    return res.json(Object.values(mapping));
  } catch (error) {
    return res.json([]);
  }
});

router.get("/observatories", async (req, res) => {
  try {
    const mapping = {};
    const responseAggregate = await client.search({
      index: "stars", // Replace 'Stars' with your actual index name
      size: 0, // Set to 0 to only retrieve aggregation results without actual documents
      body: {
        aggs: {
          eventSource: {
            terms: { field: "eventSource.keyword" },
          },
        },
      },
    });

    const responseDangerous = await client.search({
      index: "stars", // Replace 'Stars' with your actual index name
      size: 0, // Set to 0 to only retrieve aggregation results without actual documents
      body: {
        query: {
          range: {
            urgency: { gte: 3 }, // Filter events with urgency greater than 3
          },
        },
        aggs: {
          eventSourceUrgent: {
            terms: { field: "eventSource.keyword" },
          },
        },
      },
    });

    const {
      body: {
        aggregations: { eventSource },
      },
    } = responseAggregate;

    for (const bucketObj of eventSource.buckets) {
      if (bucketObj?.key) {
        mapping[bucketObj?.key] = {
          ObservatoryName: bucketObj?.key?.slice(0, 5),
          NumberOfEvents: bucketObj?.doc_count,
          NumberOfDangerousEvents: 0,
        };
      }
    }

    const {
      body: {
        aggregations: { eventSourceUrgent },
      },
    } = responseDangerous;

    for (const bucketObj of eventSourceUrgent.buckets) {
      if (bucketObj?.key && mapping[bucketObj?.key]) {
        mapping[bucketObj?.key].NumberOfDangerousEvents = bucketObj?.doc_count;
      }
    }

    res.json(Object.values(mapping));
  } catch (error) {
    console.error(error);
    res.status(500).send([]);
  }
});

export { router };
