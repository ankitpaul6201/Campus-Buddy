# Campus Buddy 🎓

> **India's Premier Hyper-Local Campus Peer-to-Peer Marketplace & Student Community Platform**

[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Campus Buddy** is a modern, high-performance web platform built for college students across India. It connects students within university ecosystems to securely buy, sell, exchange, and rent textbooks, hostel essentials, electronics, bicycles, and course equipment with **0% commission** and **zero shipping delays**.

Every exchange is verified, local, and physically completed inside college hostels, cafeterias, and campus gates.

---

## ✨ Key Features

### 🛍️ Hyper-Local Verified Marketplace
- **Hostel Handovers**: Trade directly with verified peers in your own hostel wing, department, or campus gates.
- **Categorized Listings**: Textbooks & prep material, cycle & mobility, gadgets & calculators, lab equipment, room decor, and hostel appliances.
- **Transparent Listings**: Transparent student condition tags (Brand New, Lightly Used, Battle Tested).

### 🔒 Student Trust & Verification
- **Dual Sign-up Pathways**: Register with your university email or your personal Gmail account with student ID verification.
- **Safety First**: Zero strangers—listings are restricted to confirmed students and campus neighbors.
- **DPDP Act 2023 Compliant**: Robust data protection policy, privacy controls, and direct grievance officer oversight.

### 🌐 3D Interactive Campus Visualizer
- **Three.js Dotted Globe**: Real-time 3D rendered sphere mapping active student clusters across academic hubs.
- **Interactive India Campus Map**: Visualizes coverage across IITs, NITs, BITS, Central Universities, and technical institutes.

### 💳 Transparent Club & Student Memberships
- **Bouncy Glassmorphic Pricing Switcher**: Seamless spring transitions between monthly and annual plans.
- **Free for Students Forever**: 0% fee on peer handovers. Optional society & club premium management tiers.

### 📜 Integrated Legal & Policy Center
- **Smooth Spring Modal**: Bottom-rising zoom-in/zoom-out transition with blurred backdrop.
- **Pill Navigation**: Glassmorphic tab bar with animated sliding pill for Terms of Service, Privacy Policy, and Student Safety Guidelines.
- **Lenis Smooth Scroll Sync**: Dynamic scroll hijacking prevention when legal documents are open.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Core** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer |
| **Motion & 3D** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/), [Three.js](https://threejs.org/), [dotted-map](https://github.com/masonic/dotted-map) |
| **Smooth Scrolling** | [Lenis](https://github.com/darkroomengineering/lenis) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm** (or `yarn` / `pnpm`)
- **Git**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ankitpaul6201/Campus-buddy-website.git
   cd Campus-buddy-website
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
website/
├── public/                     # Static assets (favicons, avatars, maps)
├── src/
│   ├── components/             # Reusable UI sections & widgets
│   │   ├── legal/              # Legal documents (Terms, Privacy, Guidelines modal)
│   │   │   ├── LegalModal.tsx
│   │   │   └── LegalPortal.tsx
│   │   ├── AboutSection.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── CommunitySection.tsx
│   │   ├── DownloadCTASection.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── IndiaMapSection.tsx
│   │   ├── InteractiveGlobe.tsx
│   │   ├── Navbar.tsx
│   │   ├── PricingSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── TrustSafetySection.tsx
│   ├── data/                   # Mock datasets & geo-coordinates
│   │   ├── mockData.ts
│   │   └── worldDottedPoints.json
│   ├── App.tsx                 # Main layout and view orchestrator
│   ├── index.css               # Global typography and Tailwind directives
│   └── main.tsx                # React DOM mount point
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚖️ Governance & Compliance

For statutory disputes, data privacy inquiries, or intermediary compliance under India's **Information Technology Rules, 2021** and **DPDP Act 2023**:

- **Statutory Grievance Officer**: Ankit Paul, Legal Head
- **Email**: [grievance@campusbuddy.in](mailto:grievance@campusbuddy.in) / [contact@campusbuddy.in](mailto:contact@campusbuddy.in)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
