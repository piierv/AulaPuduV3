// src/app/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routers
const authRouter = require('../router/auth.router');
const presentationRouter = require('../router/presentation.router');
const sessionRouter = require('../router/session.router');
const materialRouter = require('../router/material.router');
const activitiesRouter = require('../router/activities.router');
const attendeesRouter = require('../router/attendees.router');
const examsRouter = require('../router/exams.router');
const pluginsRouter = require('../router/plugins.router');
const modulesRouter = require('../router/modules.router');
const models3dRouter = require('../router/models3d.router');
const liveSession = require("../router/liveSession.router")
const path = require("path")

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

app.get('/health', (_req, res) => res.json({ ok: true }));

// 🔐 Auth clásica
app.use('/api/auth', authRouter);

// Resto de rutas
app.use('/api/presentations', presentationRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/materials', materialRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/attendees', attendeesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/models3d', models3dRouter);
app.use("/api/live-session",liveSession)

// Manejo de error
app.use((err, _req, res, _next) => {
  console.error('🔥 Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
