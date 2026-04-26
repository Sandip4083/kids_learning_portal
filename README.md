# 🚀 Kids' Learning Portal

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-blue?style=for-the-badge&logo=framer)

A beautifully designed, highly interactive, and gamified **Educational Portal for Kids**. Built with Next.js 16 (App Router), this application provides a safe, fun, and engaging environment for children to learn Math, Science, and English through interactive stories, quizzes, and mini-games.

No backend required! All progress, XP, and streaks are securely saved locally using advanced React Context and `localStorage`.

### 🌟 [Live Demo Available Here!](https://kids-learning-portal-xi.vercel.app)

---

## ✨ Features

### 🎓 Educational Modules
- **Math & Science Quizzes**: Dynamic difficulty scaling (Easy, Medium, Hard).
- **Interactive Stories**: Beautifully animated stories with built-in **Text-to-Speech** (English & Hindi support). Read along as the text highlights!

### 🎮 Game Zone (9 Mini-Games)
A fully standardized arcade built to test memory, logic, and reflexes:
1. **Tic-Tac-Toe** (with Smart AI)
2. **Memory Match**
3. **Hangman** (15+ categories)
4. **Rock Paper Scissors**
5. **Simon Says** (Pattern memorization)
6. **Word Search**
7. **Math Bingo**
8. **Coloring Game**
9. **Classic Ludo** (vs Computer or Friends)

*Every game features a built-in "How to Play" animated guide!*

### 🏆 Gamification & Progression
- **Smart Leaderboard**: Dynamically generates rivals based on your child's current XP so they always have an achievable target.
- **Dashboard Analytics**: Tracks accuracy, strong/weak subjects, and daily streaks.
- **Daily Rewards & Spin Wheel**: Keeps kids coming back with fun daily bonuses and a randomized prize wheel.
- **Leveling System & Badges**: Earn XP to level up from "Starter" to "Legend" and unlock achievement badges.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: Canvas Confetti
- **Audio**: Web Speech API (Text-to-Speech) & HTML5 Audio

---

## 💻 Local Setup Instructions

Follow these steps to run the project on your local machine:

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/Sandip4083/kids_learning_portal.git
   cd kids_learning_portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the magic!

---

## 🚀 How to Push to GitHub

To save your code and prepare it for deployment, push it to GitHub using your terminal:

1. **Initialize Git (if not already initialized)**:
   ```bash
   git init
   ```

2. **Add all files to staging**:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "Initial commit: Production ready Kids Learning Portal"
   ```

4. **Link to your GitHub Repository**:
   *(First, create an empty repository on GitHub, then copy its URL)*
   ```bash
   git branch -M main
   git remote add origin https://github.com/Sandip4083/kids_learning_portal.git
   ```

5. **Push the code**:
   ```bash
   git push -u origin main
   ```

---

## 🌍 How to Deploy to Vercel

Vercel is the easiest way to deploy a Next.js application for free.

1. **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up using your GitHub account.
2. **Import Project**:
   - Click on **"Add New..."** and select **"Project"**.
   - Find your `kids_learning_portal` repository from the GitHub list and click **"Import"**.
3. **Configure Project**:
   - Vercel will automatically detect that it is a Next.js project.
   - You don't need to change any build commands (`npm run build` is already set).
4. **Deploy**:
   - Click the **"Deploy"** button.
   - Vercel will build the application (this takes about 1-2 minutes).
5. **Done! 🎉** 
   - Vercel will provide you with a live URL (e.g., `https://kids-learning-portal.vercel.app`) that you can share with anyone!

---

## 🎨 Designed by Sandip
*Made with ❤️ for kids to learn and grow.*
