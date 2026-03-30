# 🛵 GigShield — AI-Powered Parametric Income Insurance for Food Delivery Partners


> **Guidewire DEVTrails 2026 | University Hackathon**  
> Protecting Zomato & Swiggy delivery partners from income loss due to uncontrollable external disruptions.

Every time it rains, thousands of delivery workers are forced offline — and the moment they stop working, their income drops to zero.

## 🌐 Live Demo
https://prismatic-cascaron-ade43b.netlify.app/

---


## 📌 Problem Statement

India's food delivery partners (Zomato, Swiggy) earn ₹15,000–₹25,000/month but lose 20–30% of weekly income whenever external disruptions like heavy rain, floods, extreme heat, or local curfews force them off the road. There is currently no financial safety net for these workers.

**GigShield** is a parametric income insurance platform that automatically detects disruptions, triggers claims without any manual effort, and pays out lost wages directly to the worker — all within minutes.

---

## ❓ Why Parametric Insurance?

Traditional insurance requires manual claim filing and verification, which can take days.

GigShield uses parametric triggers (e.g., rainfall > 35mm/hr) to automatically detect disruptions and instantly approve payouts — eliminating paperwork, delays, and uncertainty.


## 👤 Persona: Food Delivery Partner (Zomato / Swiggy)

| Attribute | Detail |
|-----------|--------|
| **Name** | Ravi Kumar |
| **Platform** | Zomato / Swiggy |
| **City** | Hyderabad (Madhapur & Kondapur zones) |
| **Avg. Weekly Earnings** | ₹4,000 – ₹6,000 |
| **Working Hours** | 10–12 hours/day, 6 days/week |
| **Pain Point** | Loses ₹800–₹1,500/week during monsoon or heatwave days |
| **Device** | Android smartphone (₹8,000–₹12,000 range) |
| **Digital Literacy** | UPI-literate; uses Zomato/Swiggy app daily |
| **Language** | Telugu / Hindi primary |

Food delivery partners are the most weather-exposed gig workers. Unlike e-commerce partners who can shift indoors, Zomato/Swiggy riders have zero fallback — no orders means zero income. Their weekly settlement cycle makes them the perfect fit for a weekly insurance model.

---

## 🎬 Persona-Based Scenarios

**Scenario 1 — Heavy Rain:** Rainfall in Madhapur exceeds 35mm/hr. GigShield detects the trigger → validates Ravi's GPS was in the disruption zone → transfers ₹500 (50% daily wage) to his UPI in under 60 seconds. Zero action from Ravi.

**Scenario 2 — Heatwave:** IMD issues Red Alert above 44°C. GigShield triggers 40% daily wage payout for all enrolled workers in the flagged zone.

**Scenario 3 — Curfew / Bandh:** Unplanned bandh shuts Ravi's zone. GigShield detects mobility collapse via traffic anomaly API → auto-triggers 60% daily wage protection.

**Scenario 4 — Severe Flooding:** IMD Flood Warning active. GigShield cross-references flood polygon with worker GPS zone → triggers 75% daily wage payout (highest tier).

**Scenario 5 — Air Quality Emergency:** CPCB AQI crosses 400 (Severe) for 3+ hours → 30% daily wage protection triggered.

---

## 🔄 Application Workflow

```
[Worker Onboarding]
        │
        ▼
[AI Risk Profiling]  ←── Zone history + Weather data + Earnings baseline
        │
        ▼
[Weekly Policy Issuance]  ←── Dynamic premium per worker profile
        │
        ▼
[Real-Time Disruption Monitoring]  ←── Weather API + IMD + CPCB + Civic Alerts
        │ Trigger detected
        ▼
[Fraud Validation]  ←── GPS zone check + Activity score + Duplicate hash
        │ Pass
        ▼
[Auto Claim Approved + Instant UPI Payout]  ←── Target: < 60 seconds
        │
        ▼
[Dashboard Updated]  ←── Worker view + Admin/Insurer view
```

---

## 💰 Weekly Premium Model

Premiums are auto-deducted from weekly platform settlements — zero friction for the worker.

| Coverage Tier | Weekly Premium | Max Weekly Payout |
|---------------|---------------|-------------------|
| Basic Shield | ₹25/week | ₹500 |
| Standard Shield | ₹49/week | ₹1,200 |
| Pro Shield | ₹79/week | ₹2,000 |

**Dynamic Pricing Formula:**
```
Final Premium = Base Premium × Zone Risk Score × Weather Season Multiplier × Claim History Factor
```

| Factor | Range | Logic |
|--------|-------|-------|
| Zone Risk Score | 0.8 – 1.3 | Historical waterlogging/disruption frequency per zone |
| Weather Season Multiplier | 1.0 – 1.4 | 1.4 during peak monsoon (July–Sept) |
| Claim History Factor | 0.95 – 1.1 | Reward clean history; flag frequent claims |

The model re-scores every worker every Sunday night using a 7-day weather forecast — proactive, not reactive.

---

## ⚡ Parametric Triggers

| # | Trigger | Data Source | Threshold | Payout |
|---|---------|-------------|-----------|--------|
| 1 | Heavy Rainfall | OpenWeatherMap API | > 35mm/hr in worker's zone | 50% daily wage |
| 2 | Extreme Heat | IMD API | > 43°C + Red Alert issued | 40% daily wage |
| 3 | Severe Flooding | Government Disaster API | Flood warning active in zone | 75% daily wage |
| 4 | Air Quality Emergency | CPCB AQI API | AQI > 400 for 3+ hrs | 30% daily wage |
| 5 | Curfew / Bandh | Civic Alerts + Traffic API | Official restriction or mobility collapse | 60% daily wage |

> Income loss only. No vehicle repair, health, or accident payouts.

---

## 🤖 AI/ML Integration

**Dynamic Premium Calculation** — XGBoost regression model trained on IMD 5-year historical weather data. Features: zone ID, season, rainfall frequency, order density, prior claim rate. Re-scores weekly.

**Fraud Detection** — Isolation Forest anomaly detection + rule-based layer:
- GPS spoofing: cross-check worker GPS against disruption zone polygon
- Activity score: deliveries logged during claimed disruption = flagged
- Duplicate prevention: hash on worker_id + trigger_id + date
- Collusion: flag if 90%+ of zone workers claim within 10 minutes

**Predictive Risk Modeling** — 7-day forecast integration to pre-adjust premiums and identify high-risk zones before disruptions occur.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Worker App | React Native (Android-first) |
| Admin Dashboard | React.js + Tailwind CSS |
| Backend API | Node.js (Express) + Python FastAPI |
| Database | PostgreSQL |
| Cache / Real-time | Redis |
| ML Models | scikit-learn, XGBoost (via FastAPI) |
| Weather / AQI | OpenWeatherMap + IMD + CPCB AQI API |
| Payment | Razorpay Test Mode / UPI Simulator |
| Auth | Firebase Auth (OTP-based) |
| Hosting | AWS EC2 + Vercel |

---

## ⚠️ What GigShield Does NOT Cover

| ❌ Excluded | ✅ Covered |
|------------|-----------|
| Health / life insurance | Income loss from weather disruptions |
| Vehicle repair | Income loss from civic/social disruptions |
| Accident medical bills | Automated weekly wage protection |

---

## 💬 Final Thought

GigShield doesn’t insure vehicles or people — it insures income. And for gig workers, income is everything.
