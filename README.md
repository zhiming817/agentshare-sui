# AgentShare-Sui

An AI Agent conversation sharing platform on the Sui blockchain. Upload, share, and discover high-quality AI Agent interactions with decentralized storage and privacy-focused access control.

[![GitHub Repo](https://img.shields.io/badge/GitHub-agentshare--sui-orange?logo=github)](https://github.com/zhiming817/agentshare-sui)

## 🌟 Overview

AgentShare-Sui enables developers and AI enthusiasts to persist their most valuable AI conversations. By leveraging the **Sui Blockchain**, **Walrus Storage**, and **Sui Seal**, it provides a unique ecosystem for sharing knowledge while retaining ownership and monetization capabilities.

## 🚀 Key Features

- **Multi-Format Import** — Support for 10+ formats including Claude Code (JSONL), OpenAI, Cursor, Windsurf, Trae, Aider, Copilot, Cline, and more.
- **Decentralized Storage** — Conversations are stored on **Walrus**, ensuring high availability and tamper-proof data.
- **Privacy Controls (Sui Seal)** — 
  - **Whitelisting**: Restrict access to specific wallet addresses.
  - **Subscription**: Monetize your content by charging a one-time fee in USDC (deployed on Sui).
- **Search & Discovery** — Advanced filtering by tags, popularity, and latest updates.
- **Sui Integration** — Native wallet support via `@mysten/dapp-kit`.

## 🛠 Tech Stack

- **Backend**: Rust (Actix-web + Sea-ORM)
- **Frontend**: React (Vite + Material UI)
- **Database**: PostgreSQL (for metadata indexing)
- **Blockchain**: Sui & Walrus Storage

## 📦 Project Structure

```text
agentshare-sui/
├── backend/    # Rust backend service (REST API)
├── web/        # React + Vite frontend application
├── contract/   # Move contracts for Sui
└── doc/        # Documentation and design specs
```

## 🏁 Quick Start

### Prerequisites

- **Rust** (Edition 2024+)
- **Node.js** (18+)
- **PostgreSQL**
- **Sui Wallet** (Testnet/Devnet)

### Backend Setup (Rust)

1. Navigate to the backend directory:
   ```bash
   cd backend/rust_backend
   ```
2. Configure your environment:
   ```bash
   # Update DATABASE_URL in your .env
   ```
3. Initialize the database:
   ```bash
   ./scripts/init_db.sh
   ./scripts/setup.sh
   ```
4. Run the server:
   ```bash
   cargo run
   ```

### Frontend Setup (Vite)

1. Navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🔗 Repository

- **Main Repo**: [https://github.com/zhiming817/agentshare-sui](https://github.com/zhiming817/agentshare-sui)

## 📄 License

This project is licensed under the MIT License.

