# 🌩️ Cloud-Based Big Data Analytics Platform

### An end-to-end real-time analytics system built using modern cloud-native technologies.


---

## 🧠 Overview

We designed a cloud-native data pipeline to fetch and visualize data from:
- NASA API
- A custom simulator integrated with Kafka & ElasticSearch
- Web scraping from two live websites

The project architecture includes:
- ⚙️ Microservices backend (NodeJS)
- 💾 ElasticSearch for storage
- 📡 Kafka for stream processing
- ⚛️ ReactJS frontend (SPA)
- 🚨 Real-time event alerting via Socket.io
- 🐳 Containerized services via Docker Compose
- 🧠 Lambda-style stream architecture

---

## 🏗️ Architecture Overview

![Architecture Overview](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/1a8f8866-09f1-4f73-9b0b-a6f0ccebbbc9)


---

## 🚀 Local Development

Clone the project:

```bash
git clone https://github.com/reponame
cd Cloud-Based Big Data Analytics Platform
```

> ⚠️ You need the required `.env` files to run the services.  
> 💻 For Apple M1/M2 chips, the Dockerfiles are optimized for ARM64. For x86, you’ll need to modify them accordingly.

### 🐳 Docker Services

Make sure Docker Engine is running, then build and start services:

```bash
docker-compose build
docker-compose up
```

### 🔍 Scraper Setup

```bash
cd scraper
npm i
npm start
```

### 🎨 Frontend Setup

```bash
cd frontend
npm i
npm run dev
```

Press `o` to auto-open the browser.

---

## 🖼️ Screenshots

| UI Dashboard | Stream Processing | Alerts |
|:------------:|:-----------------:|:------:|
| ![UI](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/fbf720f6-a4bf-4052-a3f6-9301199467af) | ![Stream](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/66345933-5fde-4cdb-8462-5521af64c52e) | ![Alert](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/9aad4a2d-eb54-4149-85bd-273501630d69) |

---

## 📚 Project Materials

| Kafka Flow | Microservices | ElasticSearch | Real-Time Data |
|:----------:|:-------------:|:-------------:|:--------------:|
| ![6](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/bd00e492-9207-4910-9d5f-36a4a0de0e6a) | ![7](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/6db11b1d-2fe8-4996-8408-25c9f56ba293) | ![8](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/19de6688-0cf0-431e-a39d-80c5290e14b4) | ![9](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/40a3d900-2a07-4937-bf27-061fbd892496) |

---

## 🔄 Development Process

### 🧑‍🤝‍🧑 Agile Team Collaboration

Worked in agile sprints to ship modular milestones.


![Agile2](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/626ecd56-5b43-49d0-a8e2-8ef08564e183)

---

## 🧹 Web Scraper Module

| Scraper Dashboard | Configs | Data Extract |
|:-----------------:|:-------:|:------------:|
| ![14](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/c4626521-9c5f-430d-a42a-c3bfe8b2d545) | ![15](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/d037fb35-2e96-4fdc-9fc1-0b6db8567e4d) | ![16](https://github.com/dolev146/BigData-Cloud-Computing-project/assets/62290677/ceef2473-04ed-4615-b829-1b7fb6e52885) |

---

## 🚀 Tech Highlights

- **Docker** for environment parity
- **Kafka + ElasticSearch** for high-throughput pipelines
- **Socket.io** for real-time alerting
- **NodeJS Microservices** for modular backend
- **React SPA** for dynamic user experience

---

## 🔗 Links
- 🧠 Project Repo: https://github.com/adnanbaqi/Cloud-Based-Big-Data-Analytics-Platform.git
