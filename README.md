# 🥗 Smart Food Intelligence

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Design](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/wFYOlNMilBqg11MpBWax2m/first?node-id=6-12&t=jEuMUfFKnn8rHxBG-1)

**Smart Food Intelligence** is a cutting-edge web application designed to empower users with deep insights into their food choices. By scanning labels and analyzing ingredients against personal health profiles, it acts as a digital nutritionist in your pocket.

---

## 🚀 Deployed Link

🔗**[Deployed Link](https://nutriscan-jet-three.vercel.app/)**

---

## 🎨 Design & Prototype

The UI/UX was meticulously crafted to ensure a premium, accessible, and intuitive experience. You can view the original design system and wireframes here:

🔗 **[Figma Design Link](https://www.figma.com/design/wFYOlNMilBqg11MpBWax2m/first?node-id=6-12&t=jEuMUfFKnn8rHxBG-1)**

---

## 📱 App Sitemap & Pages

Our application is structured into several intuitive pages designed for a seamless user journey:

1.  **🔐 Authentication Page:** A secure gateway for users to login or create profiles.
2.  **🏠 Smart Dashboard (Home):** The primary hub featuring the **Real-Time Scanner** interface and quick-access health metrics.
3.  **👤 Personalized Profile:** A dedicated space to manage health conditions (Diabetes, BP, etc.) and toggle between family member profiles.
4.  **📊 Analysis & Result View:** The core results page showing Nutri-Scores, detailed ingredient breakdowns, and risk alerts.
5.  **🔄 Product Comparison:** A side-by-side view to compare the nutritional value of two or more products.
6.  **🕒 Scan History:** A log of all previous scans, allowing users to re-evaluate products they've checked in the past.

---

## 🔥 Core Features

Our application provides a suite of tools to revolutionize how you interact with food packaging:

### 1. 🔍 Real-Time OCR & Barcode Scanning
Leveraging advanced Optical Character Recognition (OCR), the app instantly extracts ingredient lists from any food product. No more squinting at tiny fonts on the back of a pack.

### 2. 🛡️ Personalized Health Guard
The most powerful feature of the app. It doesn't just list ingredients; it checks them against **your** health conditions. 
- **Diabetes:** Automatically flags high-glycemic ingredients.
- **Hypertension:** Alerts on excessive sodium content.
- **Allergies:** Instantly identifies hidden allergens.

### 3. 📊 Interactive Nutri-Score
Get an immediate visual health grade (A to E) for any product. Our algorithm breaks down why a product received its score, highlighting both the positive (fiber, protein) and negative (saturated fats, sugars) contributors.

### 4. 💡 AI-Powered Alternatives
If a product is deemed "Unhealthy" or "Risky," the app doesn't just stop there. it suggests **Better Alternatives** available in the market that align with your health goals.

### 5. 📉 Daily Sugar & Health Tracker
Keep a running log of your consumption. The app tracks your daily sugar intake through an interactive dashboard, helping you stay within recommended health limits.

### 6. 👥 Family Health Management
Create and switch between multiple profiles (e.g., Mom, Dad, Kids). Each profile has unique health conditions, ensuring the whole family stays safe.

---

## 🏗️ Project Architecture Overview

The system is split into two main layers designed for scalability and speed.

### 🌐 Frontend (Client-Side)
The frontend is a modern **React SPA** built for performance.
- **Components:** Modular UI elements for scanning, tracking, and analysis.
- **State Management:** Real-time feedback loops for scan results and profile updates.
- **Design:** A premium "Glassmorphism" theme optimized for both desktop and mobile.

### ⚙️ Backend (Server-Side)
A robust **Node.js/Express** environment that handles the "intelligence" of the app.
- **Intelligence Engine:** Processes raw text into structured ingredient data.
- **Database:** Secure storage for user profiles and comprehensive ingredient hazard lists.
- **API Services:** Dedicated routes for authentication, scanning history, and product comparison.

---

## 🚀 Quick Start

1. **Clone & Enter:**
   ```bash
   git clone <repo-url>
   cd internal/frontend
   ```

2. **Install:**
   ```bash
   npm install
   ```

3. **Run:**
   ```bash
   npm run dev
   ```

---

## 💡 How it Works

1. **Scan:** Point your camera at an ingredient label or barcode.
2. **Analyze:** The backend identifies additives and cross-references them with hazard databases.
3. **Compare:** Results are filtered through your personal health conditions.
4. **Decide:** Make an informed choice based on alerts, Nutri-Scores, and suggested alternatives.

---

Developed with ❤️.