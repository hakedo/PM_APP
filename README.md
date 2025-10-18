# PM_APP - Project Management Application

A modern, full-stack project management application built with React and Express.

## 🏗️ Architecture

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom component library with shadcn/ui patterns
- **Routing:** React Router DOM 7
- **Animation:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose ODM
- **API:** RESTful architecture
- **Logging:** Custom logger utility
- **Error Handling:** Centralized middleware

## 📁 Project Structure

```
PM_APP/
├── backend/
│   ├── config/          # Configuration files
│   │   ├── index.js     # Main config
│   │   └── database.js  # DB connection
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/          # Mongoose models
│   │   ├── Project.js
│   │   ├── Template.js
│   │   └── index.js
│   ├── routes/          # API routes
│   │   ├── projects.js
│   │   ├── templates.js
│   │   └── index.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   ├── .env             # Environment variables (not in repo)
│   ├── package.json
│   └── server.js        # Entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   │   ├── ui/      # Base UI components
    │   │   └── ...
    │   ├── config/      # Frontend configuration
    │   ├── hooks/       # Custom React hooks
    │   │   ├── useProjects.js
    │   │   └── useTemplates.js
    │   ├── layouts/     # Layout components
    │   │   └── Navigation/
    │   ├── lib/         # Utilities
    │   ├── pages/       # Page components
    │   │   ├── Home/
    │   │   ├── Projects/
    │   │   ├── ProjectDetails/
    │   │   ├── Settings/
    │   │   └── Templates/
    │   ├── services/    # API service layer
    │   │   ├── api.js
    │   │   ├── projectService.js
    │   │   └── templateService.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example     # Environment variable template
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5050
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5050`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables (optional):
```env
VITE_API_BASE_URL=http://localhost:5050
```

5. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:5050
```

### Endpoints

#### Projects

- **GET** `/projects` - Get all projects
- **GET** `/projects/:id` - Get project by ID
- **POST** `/projects` - Create new project
- **PUT** `/projects/:id` - Update project
- **DELETE** `/projects/:id` - Delete project

#### Templates

- **GET** `/templates` - Get all templates
- **GET** `/templates/:id` - Get template by ID
- **POST** `/templates` - Create new template
- **PATCH** `/templates/:id` - Update template
- **DELETE** `/templates/:id` - Delete template

#### Template Statuses/Items

- **POST** `/templates/:id/projectStatus/statuses` - Add project status
- **DELETE** `/templates/:id/projectStatus/statuses/:statusId` - Delete project status
- **POST** `/templates/:id/taskStatus/statuses` - Add task status
- **DELETE** `/templates/:id/taskStatus/statuses/:statusId` - Delete task status
- **POST** `/templates/:id/phase/items` - Add phase
- **DELETE** `/templates/:id/phase/items/:phaseId` - Delete phase
- **POST** `/templates/:id/deliverable/items` - Add deliverable
- **DELETE** `/templates/:id/deliverable/items/:deliverableId` - Delete deliverable

## 🛠️ Development

### Code Style

- **ESLint:** Configured for React and modern JavaScript
- **Formatting:** Follow existing patterns
- **Naming:** camelCase for variables/functions, PascalCase for components

### Best Practices

1. **API Calls:** Use the service layer, never fetch directly in components
2. **State Management:** Use custom hooks for data fetching
3. **Error Handling:** Always handle errors gracefully
4. **Validation:** Validate on both frontend and backend
5. **Logging:** Use the logger utility instead of console.log

### Adding New Features

1. **Backend:**
   - Add model in `models/` if needed
   - Create routes in `routes/`
   - Update service if needed
   - Test with Postman or similar

2. **Frontend:**
   - Create service methods in `services/`
   - Add custom hooks in `hooks/` if needed
   - Create/update components
   - Update routes in `App.jsx`

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 🔐 Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string (required)
- `PORT` - Server port (default: 5050)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5050)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

ISC

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure all required env variables are set
- Check port 5050 isn't already in use

### Frontend can't connect to backend
- Verify backend is running
- Check CORS settings
- Verify API_BASE_URL in frontend .env

### Database connection issues
- Check MongoDB Atlas network access
- Verify connection string format
- Ensure IP address is whitelisted

## 📧 Support

For issues and questions, please open an issue in the repository.
