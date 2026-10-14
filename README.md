# 🤝 Synergy Shaking Hands Club

An **invite-only members club website** where joining works like a real club: you need an invitation code, you fill an application, you get interviewed, the admin approves you, you pay a joining fee with cryptocurrency, and you receive a digital membership badge that proves you are a member. Members can then chat, hold video meetings and see every payment made to the club.

Built by **Onu Moses**.

- **Live website:** https://synergy-club-brown.vercel.app
- **Backend (server):** https://synergy-club.onrender.com/api/health
- **Smart contract on Sepolia (test network):** _add your Etherscan link here_
- **Code:** https://github.com/Demo507/synergy-club

> This project runs on **Sepolia, a practice blockchain**. The "ETH" used here is free test money with no real value, so nobody can lose real funds.

---

## 1. What the project does (in plain words)

1. The **admin** (the person who created the club) creates invitation codes.
2. A newcomer opens the website, connects their **crypto wallet** (MetaMask), and enters an invitation code.
3. They fill in the **registration form** (name, age, a few honest-answer questions, why they want to join, phone, email) and pay a small **registration fee of 0.0001 ETH**.
4. Their application goes to the **interview area**. The admin (and any members the admin chooses as interviewers) read it and write notes.
5. The admin **approves** or **rejects** the person. Approval gives the person a personal **registration code**.
6. The approved person pays the **activation fee of 0.01 ETH** and receives a **membership badge (an NFT)** in their wallet. This badge cannot be sold or transferred, so it really belongs to that one person.
7. Now they are a **member** and can:
   - **Chat** with everyone in the group chat, or privately with any single member
   - Join **video/audio meetings** and record them
   - See the **public payment log** (who paid, when, how much)
   - See their **achievements** and create **invitation codes** for friends (each code works once and expires after 30 days; maximum 5 active codes per person)
8. The admin can **expel** a member (the badge is destroyed and the wallet is banned), appoint **interviewers**, and **withdraw** the collected fees.

---

## 2. How it is built: the three big parts

Think of the project like a restaurant:

| Part | Restaurant comparison | Where it lives |
|---|---|---|
| **Frontend** | The dining room: what customers see and click | `frontend/` folder, hosted on **Vercel** |
| **Backend** | The kitchen: does the work, remembers orders, checks rules | `backend/` folder, hosted on **Render** |
| **Smart contract** | The cash register and membership register that nobody can secretly change | `contracts/` folder, lives on the **blockchain** |
| **Database** | The notebook where the kitchen writes everything down | **MongoDB Atlas** |

```
synergy-club/
├── contracts/          Smart contract + tests + deploy script
│   ├── src/ClubMembership.sol
│   ├── test/ClubMembership.t.sol
│   ├── script/DeployClub.s.sol
│   └── foundry.toml
├── backend/            The server (Node.js + Express)
│   ├── src/
│   │   ├── index.ts        All the server routes and real-time chat
│   │   ├── env.ts          Reads secret settings
│   │   ├── auth.ts         Wallet login and security checks
│   │   ├── chain.ts        Reads the blockchain
│   │   └── models/Schemas.ts   Shapes of the saved data
│   └── tsconfig.json
└── frontend/           The website (Next.js)
    └── src/
        ├── app/page.tsx        Main page and tab menu
        ├── components/         One file per screen
        ├── config/web3.ts      Talks to the blockchain
        └── lib/                Helpers (server calls, styles)
```

---

## 3. The smart contract (`ClubMembership.sol`)

A **smart contract** is a small program that lives on a blockchain. Once it is published, nobody (not even the owner) can quietly change its rules, and every payment is recorded publicly. This one is written in **Solidity**.

**What it keeps track of**
- Who has paid the registration fee, who is approved, who is fully activated, who is banned
- Which membership badge number belongs to which person
- A public list of every payment (payer, time, amount, type)

**What it can do**
| Function | In plain words | Who can use it |
|---|---|---|
| `payRegistrationFee` | Pay 0.0001 ETH to apply | Anyone not banned |
| `approveApplicant` | Approve someone who has paid | Admin only |
| `completeFinalActivation` | Pay 0.01 ETH and receive the badge (only after approval) | Approved applicant |
| `expelMember` | Destroy a member's badge and ban the wallet | Admin only |
| `unban` | Allow a banned wallet to try again | Admin only |
| `getPayments` / `paymentCount` | Show the public payment list | Anyone |
| `withdrawFunds` | Move the collected fees to the admin wallet | Admin only |
| `setMetadataURI` / `setContractURI` | Change the logo/description links | Admin only |

**Safety features**
- **Soulbound badge:** the membership NFT can be created or destroyed but never transferred, so it cannot be sold.
- **Two-step ownership transfer:** if the admin ever hands over ownership, the new owner must accept it, so a typing mistake cannot lose the club.
- **Exact fees only:** the contract rejects any amount other than the exact fee.
- **Approval required:** nobody can skip the interview by paying the activation fee early.

**Tests:** `ClubMembership.t.sol` contains 13 automatic checks (wrong fee, paying twice, skipping approval, trying to transfer the badge, expelling, withdrawing, and more). They run with Foundry.

---

## 4. The backend (the server)

The backend is a program running 24/7 on Render. The website talks to it over the internet using addresses called **API routes** (they all start with `/api/`). It does the things a website cannot safely do itself: remember people, check the rules, and read the blockchain.

**What it does**
- **Wallet login:** it asks your wallet to sign a short message (free, no money moves). A correct signature proves the wallet is yours, and the server hands you a login pass valid for 12 hours.
- **Invitation codes:** creates, checks and uses them (single use, expire after 30 days).
- **Registration:** checks on the blockchain that the fee was really paid before saving anything.
- **Approvals and roles:** tracks each person's status and who may do what.
- **Chat:** stores messages and delivers them instantly.
- **Meetings:** stores meeting recordings.
- **Protection:** blocks guessing attacks, blocks other websites from using the server, and hides secrets.

**Person statuses:** `GUEST` → `PENDING_INTERVIEW` → `APPROVED` → `ACTIVATED`. A person can also be `REJECTED` or `EXPELLED`. The admin has the special role `ADMIN`.

**Main routes**
| Route | Purpose |
|---|---|
| `GET /api/health` | Check the server is awake |
| `GET /api/auth/nonce`, `POST /api/auth/login` | Wallet login |
| `GET /api/session` | Who am I and what is my status |
| `POST /api/gate/verify` | Check an invitation code |
| `POST /api/register` | Save an application |
| `POST /api/activate` | Mark a paid member as active |
| `GET /api/members` | List active members |
| `GET/POST /api/invites` | See or create your invitation codes |
| `GET /api/interview/applicants`, `POST /api/interview/note` | Interview area |
| `POST /api/admin/approve`, `reject`, `expel`, `interviewer` | Admin decisions |
| `GET /api/chat/history`, `POST /api/chat/send` | Chat messages |
| `GET/POST /api/meetings...` | Meeting recordings |

**Saved data (MongoDB collections):** `invitations`, `userprofiles`, `messages`, `meetingrecordings`.

---

## 5. The frontend (the website)

Built with **Next.js** and **React**. The visual style is a dark "block" design with amber gold accents, rounded cards and a scrolling ticker of member names at the top.

| Screen (file) | What it shows |
|---|---|
| **Gate** (`page.tsx`) | Connect wallet, sign in, enter invitation code |
| **Register** (`RegisterTab.tsx`) | Application form and the 0.0001 ETH payment |
| **My Status** (`StatusTab.tsx`) | Waiting for interview, approval, registration code, activation payment |
| **Chat** (`ChatTab.tsx`) | Group chat, private chats with each member, unread counters, live status |
| **Meetings** (`MeetingsTab.tsx`) | Join the video room, record it, watch past recordings |
| **Payments** (`PaymentsTab.tsx`) | Public list of every payment read from the blockchain |
| **Achievements** (`AchievementsTab.tsx`) | Badges earned and your invitation codes |
| **Admin / Interviews** (`AdminTab.tsx`) | Applicants, notes, approve, reject, expel, appoint interviewers, withdraw |
| **Ticker** (`MarqueeHeader.tsx`) | Scrolling list of active members |

Helper files: `config/web3.ts` (talks to the blockchain and wallet), `lib/api.ts` (talks to the backend and retries if the free server is waking up), `lib/ui.ts` (shared button and card styles).

---

## 6. Every tool and what it is used for

**Programming languages**
| Tool | What it is | Used for |
|---|---|---|
| **Solidity** | Language for smart contracts | The membership contract |
| **TypeScript** | JavaScript with error-checking | Backend and frontend code |
| **JavaScript / React JSX (TSX)** | The language of websites | Screens in the browser |
| **CSS (via Tailwind)** | Styling language | Colours, spacing, layout |

**On your computer**
| Tool | Used for |
|---|---|
| **Windows PowerShell** | Typing commands to install, build and publish |
| **Visual Studio Code** | Writing and editing the code |
| **Node.js** | Running JavaScript/TypeScript outside the browser |
| **npm** | Downloading the libraries listed below |
| **Git** | Saving versions of the code and uploading it to GitHub |
| **Microsoft Edge** | Testing the website |
| **winget** | Windows installer tool |
| **Foundry (optional)** | Running the smart contract tests |

**Accounts and services (free tiers)**
| Service | Used for |
|---|---|
| **MetaMask** | Crypto wallet: login, payments, admin approvals |
| **Remix IDE** | Compiling and publishing the smart contract |
| **Sepolia test network** | Practice blockchain |
| **A Sepolia faucet** | Free test ETH |
| **Etherscan (Sepolia)** | Looking at transactions and the contract |
| **Pinata + IPFS** | Storing the club logo and badge description files |
| **MongoDB Atlas** | The cloud database |
| **Render** | Hosting the backend |
| **Vercel** | Hosting the website |
| **GitHub** | Storing the code publicly |
| **Jitsi Meet** | The video/audio meeting room |
| **Public Sepolia node (publicnode.com)** | Reading the blockchain without a wallet |
| **UptimeRobot (recommended)** | Pinging the server so Render's free plan does not fall asleep |
| **Claude (Anthropic)** | AI assistant that helped write and fix the code |

---

## 7. Every dependency (library) and what it does

A **dependency** is a ready-made piece of code written by someone else that we install instead of writing from scratch.

### Smart contract
| Library | What it is | Used for |
|---|---|---|
| **OpenZeppelin Contracts v5** | Industry-standard, audited contract building blocks | `ERC721` (the NFT standard for the badge) and `Ownable2Step` (safe admin ownership) |
| **forge-std** (Foundry) | Testing helpers | The tests and the optional deploy script |

### Backend, installed with `npm install`
| Library | Used for |
|---|---|
| **express** | The web server framework; defines every `/api/...` route |
| **mongoose** | Talks to MongoDB and defines the shape of saved data |
| **cors** | Only lets our own website call the server |
| **helmet** | Adds standard security headers |
| **express-rate-limit** | Stops people hammering login and invite-code checks |
| **jsonwebtoken** | Creates and checks the login pass after wallet sign-in |
| **ethers** | Verifies wallet signatures and reads the blockchain |
| **socket.io** | Real-time chat |
| **multer** | Receives uploaded meeting recordings |
| **dotenv** | Loads secret settings from the `.env` file |

### Backend, development only
| Library | Used for |
|---|---|
| **typescript** | Checks the code for mistakes and builds it |
| **ts-node-dev** | Runs the server while developing and restarts it after every change |
| **@types/node, @types/express, @types/cors, @types/jsonwebtoken, @types/multer** | Teach the editor and TypeScript what those libraries contain |

### Built into Node.js (nothing to install)
| Module | Used for |
|---|---|
| **http** | Creates the server that carries both the API and live chat |
| **path** | Builds file locations for recordings |
| **crypto** | Generates random invitation codes and one-time login numbers |

### Frontend, installed by Next.js setup
| Library | Used for |
|---|---|
| **next** | The website framework: pages, building, speed |
| **react / react-dom** | Building the screens and updating them as things change |
| **tailwindcss** (with its PostCSS plugin) | Styling directly with short class names |
| **typescript** | Error checking |
| **eslint / eslint-config-next** | Warns about code mistakes |
| **@types/react, @types/react-dom, @types/node** | Type information for the editor |

### Frontend, added by us
| Library | Used for |
|---|---|
| **ethers** | Connecting the wallet, signing in, sending payments, reading the contract |
| **lucide-react** | The small icons in the tab menu |
| **socket.io-client** | The live chat connection to the backend |

### Browser features used (nothing to install)
| Feature | Used for |
|---|---|
| **window.ethereum** | How the website talks to MetaMask |
| **fetch** | Sending requests to the backend |
| **MediaRecorder + screen capture** | Recording meetings |
| **iframe** | Showing the Jitsi meeting room inside the page |

---

## 8. Settings the project needs (environment variables)

These are private settings kept **outside** the code. Never upload real values to GitHub.

**Backend (set on Render, or in `backend/.env` locally)**
| Name | Meaning |
|---|---|
| `PORT` | Port the server listens on (Render sets this itself) |
| `MONGO_URI` | Connection address of the database (contains a password, keep secret) |
| `JWT_SECRET` | Long random text used to sign login passes (keep secret) |
| `ADMIN_WALLET` | Wallet address of the admin (must be the wallet that deployed the contract) |
| `CONTRACT_ADDRESS` | Address of the published smart contract |
| `RPC_URL` | Address of the blockchain node the server reads from |
| `FRONTEND_URL` | Address of the website, so only it can use the server |

**Frontend (set on Vercel, or in `frontend/.env.local` locally)**
| Name | Meaning |
|---|---|
| `NEXT_PUBLIC_API_URL` | Address of the backend |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Address of the smart contract |
| `NEXT_PUBLIC_RPC_URL` | Blockchain node address (backup for reading) |
| `NEXT_PUBLIC_JITSI_ROOM` | Name of the meeting room (use a long random name) |
| `NEXT_PUBLIC_JITSI_DOMAIN` | Meeting service address (`meet.jit.si`) |

Anything starting with `NEXT_PUBLIC_` is visible to everyone, so never put a secret there.

---

## 9. Security in simple terms

- **No passwords.** You log in by signing a message with your wallet.
- **Payments are verified on the blockchain,** not just trusted from the website.
- **Admin powers are checked by the server and by the contract.**
- **Secrets stay out of GitHub** through the `.gitignore` file.
- **Limits on guessing:** rate limiting on login and invitation checks.
- **Only the club website may call the server** (CORS).
- **Personal data** (phone, email, answers) is visible only to the admin and appointed interviewers. If you run this for real people, add a privacy notice and keep that data protected under your country's data-protection law.

---

## 10. Running it on your own computer

```powershell
# Backend
cd backend
npm install
# create a .env file using .env.example, then:
npm run dev

# Frontend (in a second window)
cd frontend
npm install
# create a .env.local file using .env.local.example, then:
npm run dev
```
Open `http://localhost:3000`.

**To deploy:** the contract goes through Remix, the database lives on MongoDB Atlas, the backend is deployed from the `backend` folder on Render (build: `npm install --include=dev && npm run build`, start: `npm start`), and the frontend from the `frontend` folder on Vercel.

---

## 11. Known limits

- The free Render server falls asleep after 15 minutes without visitors, so the first visit can be slow. A free pinger such as UptimeRobot fixes this.
- Meeting recordings are stored on Render's free temporary disk, so they can disappear when the server restarts. A real launch should store them on Cloudinary or Amazon S3.
- The free Jitsi service can limit embedded rooms. A real launch should use a paid Jitsi plan.
- This runs on a test blockchain. Moving to real Ethereum needs a security review first.
- The membership fee amounts are fixed inside the contract. Changing them means publishing a new contract.

---

## 12. Glossary

| Word | Meaning |
|---|---|
| **Wallet (MetaMask)** | Your digital ID and purse; signing with it proves who you are |
| **Blockchain** | A public record book shared by thousands of computers that nobody can secretly edit |
| **Smart contract** | A program on the blockchain with fixed rules |
| **NFT** | A unique digital item recorded on the blockchain, here, your membership badge |
| **Soulbound** | An NFT that cannot be transferred to anyone else |
| **ETH / Sepolia ETH** | The currency of Ethereum; Sepolia ETH is free practice money |
| **Gas** | The small network fee for each transaction |
| **API** | The list of requests the website can ask the server to do |
| **Database** | Where the server stores its information permanently |
| **JWT (login pass)** | A temporary digital pass that proves you signed in |
| **IPFS** | A decentralized file storage; used for the logo and badge description |
| **Environment variable** | A private setting kept outside the code |

