/**
 * Complete System Seed Script
 * Genera datos completos para TODAS las colecciones del sistema RespiCare
 * 
 * Colecciones incluidas:
 * 1. Users (pacientes, doctores, admin)
 * 2. MedicalHistory (historias médicas enlazadas)
 * 3. SymptomReports (reportes de síntomas para dashboards)
 * 4. WearableData (datos de wearables sincronizados)
 * 5. ChatConversations (conversaciones de chat)
 * 6. Appointments (citas médicas)
 * 7. Prescriptions (prescripciones médicas) ⭐ NUEVO
 * 8. Alerts (alertas del sistema)
 * 9. AIAnalyses (análisis de IA enlazados)
 * 10. AutomaticReports (reportes automáticos) ⭐ NUEVO
 * 11. MLExperiments (experimentos ML) ⭐ NUEVO
 * 12. AuditLogs (logs de auditoría) ⭐ NUEVO
 * 13. ConsentLogs (logs de consentimiento) ⭐ NUEVO
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/respicare_dev';

// Load all models
const SymptomReportModel = require('../models/SymptomReport');
const ChatConversationModel = require('../models/ChatConversation');
let UserModel, MedicalHistoryModel, WearableDataModel, AppointmentModel, AlertModel, AIAnalysisModel;
let PrescriptionModel, AutomaticReportModel, MLExperimentModel, AuditLogModel, ConsentLogModel;

try {
  UserModel = require('../models/User');
} catch (error) {
  console.warn('User model not available, will create inline schema');
}

try {
  MedicalHistoryModel = require('../models/MedicalHistory');
} catch (error) {
  console.warn('MedicalHistory model not available');
}

try {
  WearableDataModel = require('../models/WearableData');
} catch (error) {
  console.warn('WearableData model not available');
}

try {
  AppointmentModel = require('../models/Appointment');
} catch (error) {
  console.warn('Appointment model not available');
}

try {
  AlertModel = require('../models/Alert');
} catch (error) {
  console.warn('Alert model not available');
}

try {
  AIAnalysisModel = require('../models/AIAnalysis');
} catch (error) {
  console.warn('AIAnalysis model not available');
}

try {
  PrescriptionModel = require('../models/Prescription');
} catch (error) {
  console.warn('Prescription model not available');
}

try {
  AutomaticReportModel = require('../models/AutomaticReport');
} catch (error) {
  console.warn('AutomaticReport model not available');
}

try {
  MLExperimentModel = require('../models/MLExperiment');
} catch (error) {
  console.warn('MLExperiment model not available');
}

try {
  AuditLogModel = require('../models/AuditLog');
} catch (error) {
  console.warn('AuditLog model not available');
}

try {
  ConsentLogModel = require('../models/ConsentLog');
} catch (error) {
  console.warn('ConsentLog model not available');
}

// Constants
const DISTRICTS = [
  { name: 'Centro de Tacna', lat: -18.0056, lng: -70.2444 },
  { name: 'Gregorio Albarracín', lat: -18.0303, lng: -70.2489 },
  { name: 'Ciudad Nueva', lat: -18.0125, lng: -70.2467 },
  { name: 'Alto de la Alianza', lat: -18.0156, lng: -70.2500 },
  { name: 'Boca del Río', lat: -18.0200, lng: -70.2600 },
  { name: 'Pocollay', lat: -18.0083, lng: -70.2522 },
  { name: 'Calana', lat: -18.0100, lng: -70.2400 },
  { name: 'Pachia', lat: -18.0300, lng: -70.2300 },
];

const SYMPTOMS = [
  'tos', 'fiebre', 'dificultad_respiratoria', 'sibilancias', 'fatiga',
  'dolor_pecho', 'congestion_nasal', 'dolor_garganta', 'escalofrios',
  'dolor_cabeza', 'nauseas', 'vomitos', 'diarrea', 'perdida_apetito'
];

const SUSPECTED_DISEASES = [
  'asma', 'neumonia', 'bronquitis', 'covid19', 'gripe', 'epoc', 'resfriado', 'unknown'
];

const DIAGNOSES = [
  'Asma bronquial', 'Bronquitis aguda', 'Neumonía', 'COVID-19', 'Gripe',
  'Resfriado común', 'Alergia respiratoria', 'EPOC', 'Faringitis', 'Laringitis'
];

const MEDICATIONS = [
  { name: 'Paracetamol', dosage: '500mg', form: 'Tableta', frequency: 3 },
  { name: 'Ibuprofeno', dosage: '400mg', form: 'Tableta', frequency: 2 },
  { name: 'Amoxicilina', dosage: '500mg', form: 'Cápsula', frequency: 3 },
  { name: 'Azitromicina', dosage: '500mg', form: 'Tableta', frequency: 1 },
  { name: 'Salbutamol', dosage: '100mcg', form: 'Inhalador', frequency: 4 },
  { name: 'Budesonida', dosage: '200mcg', form: 'Inhalador', frequency: 2 },
  { name: 'Prednisona', dosage: '20mg', form: 'Tableta', frequency: 1 },
  { name: 'Loratadina', dosage: '10mg', form: 'Tableta', frequency: 1 },
  { name: 'Dexametasona', dosage: '4mg', form: 'Tableta', frequency: 2 },
  { name: 'Levofloxacino', dosage: '500mg', form: 'Tableta', frequency: 1 },
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/medical-histories',
  '/api/v1/appointments',
  '/api/v1/prescriptions',
  '/api/v1/alerts',
  '/api/v1/dashboard',
  '/api/v1/analytics/dashboard',
  '/api/v1/symptom-analyzer/analyze',
  '/api/v1/users',
  '/api/v1/wearables',
];

// Helper functions
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 1. Seed Users
async function seedUsers() {
  const User = UserModel || mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['patient', 'doctor', 'admin'] },
    avatar: String,
    phone: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  }, { timestamps: true }));

  const users = [
    {
      name: 'Admin RespiCare',
      email: 'admin@demo.com',
      password: await bcrypt.hash('admin1234', 10),
      role: 'admin',
      isActive: true,
    },
    {
      name: 'Dr. Juan Pérez',
      email: 'doctor@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'doctor',
      isActive: true,
    },
    {
      name: 'Dra. Laura Martínez',
      email: 'laura.martinez@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'doctor',
      isActive: true,
    },
    {
      name: 'Juan Pérez',
      email: 'juan.perez@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'patient',
      isActive: true,
    },
    {
      name: 'María García',
      email: 'maria.garcia@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'patient',
      isActive: true,
    },
    {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'patient',
      isActive: true,
    },
    {
      name: 'Ana López',
      email: 'ana.lopez@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'patient',
      isActive: true,
    },
    {
      name: 'Paciente Demo',
      email: 'paciente@demo.com',
      password: await bcrypt.hash('demo1234', 10),
      role: 'patient',
      isActive: true,
    },
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} usuarios creados/actualizados`);
  return createdUsers;
}

// 2. Seed Symptom Reports
async function seedSymptomReports(count = 900) {
  const SymptomReport = SymptomReportModel;
  const reports = [];

  // Generar fechas distribuidas en el último año para mejor distribución
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const district = randomElement(DISTRICTS);
    const symptoms = randomElements(SYMPTOMS, randomInt(2, 5)).map(name => ({
      name,
      severity: randomElement(['mild', 'moderate', 'severe']),
      duration: {
        value: randomInt(1, 7),
        unit: randomElement(['hours', 'days', 'weeks'])
      }
    }));

    const category = randomElement(['respiratory', 'fever', 'pain', 'digestive', 'fatigue', 'neurological']);
    const overallSeverity = randomElement(['low', 'medium', 'high']);
    
    // Generar fecha aleatoria en el último año
    const reportedDate = randomDate(oneYearAgo, now);

    reports.push({
      patientId: null, // Puede ser anónimo
      location: {
        district: district.name,
        coordinates: {
          latitude: district.lat + randomFloat(-0.01, 0.01),
          longitude: district.lng + randomFloat(-0.01, 0.01),
        },
        address: `${district.name}, Tacna, Perú`
      },
      symptoms,
      category,
      overallSeverity,
      suspectedDisease: randomElement(SUSPECTED_DISEASES),
      temperature: category === 'fever' ? randomFloat(36.5, 39.5) : undefined,
      oxygenSaturation: category === 'respiratory' ? randomFloat(85, 100) : undefined,
      hasPreexistingConditions: Math.random() > 0.7,
      preexistingConditions: Math.random() > 0.7 ? randomElements(['diabetes', 'hipertensión', 'asma', 'epoc'], randomInt(1, 2)) : [],
      status: randomElement(['pending', 'reviewed', 'urgent', 'resolved']),
      medicalAttentionRequired: overallSeverity === 'high',
      medicalAttentionReceived: overallSeverity === 'high' && Math.random() > 0.3,
      reportedBy: randomElement(['patient', 'family', 'healthcare_worker', 'anonymous']),
      source: randomElement(['web', 'mobile', 'phone', 'hospital']),
      isAnonymous: Math.random() > 0.5,
      reportedAt: reportedDate,
      createdAt: reportedDate, // Usar la misma fecha para createdAt también
    });
  }

  await SymptomReport.deleteMany({});
  
  // Insertar con timestamps manuales para preservar las fechas aleatorias
  const reportsWithTimestamps = reports.map(report => ({
    ...report,
    createdAt: report.reportedAt,
    updatedAt: report.reportedAt
  }));
  
  // Usar insertMany con validateBeforeSave: false para evitar validaciones que puedan sobrescribir fechas
  await SymptomReport.insertMany(reportsWithTimestamps, { ordered: false });
  console.log(`✅ ${reports.length} reportes de síntomas insertados`);
}

// 3. Seed Medical Histories
async function seedMedicalHistories(users) {
  const MedicalHistory = MedicalHistoryModel || mongoose.model('MedicalHistory', new mongoose.Schema({}, { timestamps: true }));
  
  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');
  const histories = [];

  for (const patient of patients) {
    const historyCount = randomInt(1, 3);
    for (let i = 0; i < historyCount; i++) {
      const doctor = randomElement(doctors);
      const symptoms = randomElements(SYMPTOMS, randomInt(2, 5)).map(name => ({
        name,
        severity: randomElement(['mild', 'moderate', 'severe']),
        duration: `${randomInt(1, 7)} días`,
        description: `Síntoma de ${name}`
      }));

      const district = randomElement(DISTRICTS);
      const diagnosis = randomElement(DIAGNOSES);

      histories.push({
        patientId: patient._id.toString(),
        doctorId: doctor._id.toString(),
        patientName: patient.name,
        age: randomInt(18, 80),
        diagnosis,
        symptoms,
        description: `Historia médica para ${patient.name} con diagnóstico de ${diagnosis}`,
        date: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
        location: {
          latitude: district.lat + randomFloat(-0.01, 0.01),
          longitude: district.lng + randomFloat(-0.01, 0.01),
          address: `${district.name}, Tacna, Perú`
        },
        isOffline: false,
        syncStatus: 'synced',
      });
    }
  }

  await MedicalHistory.deleteMany({});
  const createdHistories = await MedicalHistory.insertMany(histories);
  console.log(`✅ ${createdHistories.length} historias médicas insertadas`);
  return createdHistories;
}

// 4. Seed Wearable Data
async function seedWearableData(users) {
  const WearableData = WearableDataModel || mongoose.model('WearableData', new mongoose.Schema({}, { timestamps: true }));
  
  const patients = users.filter(u => u.role === 'patient');
  const wearableRecords = [];

  for (const patient of patients) {
    // Generar datos de últimos 30 días, 3-5 mediciones por día
    const days = 30;
    const measurementsPerDay = randomInt(3, 5);

    for (let day = 0; day < days; day++) {
      for (let m = 0; m < measurementsPerDay; m++) {
        const timestamp = new Date(Date.now() - (days - day) * 24 * 60 * 60 * 1000);
        timestamp.setHours(randomInt(6, 22), randomInt(0, 59), 0, 0);

        wearableRecords.push({
          patientId: patient._id,
          heartRate: randomInt(60, 100),
          oxygenSaturation: randomFloat(95, 100, 1),
          steps: randomInt(0, 15000),
          distance: randomFloat(0, 10, 2),
          respiratoryRate: randomInt(12, 20),
          sleepHours: day === 0 ? randomFloat(6, 9, 1) : undefined, // Solo para el primer día
          timestamp,
          source: randomElement(['apple_health', 'google_fit', 'manual']),
          syncedAt: timestamp,
        });
      }
    }
  }

  await WearableData.deleteMany({});
  await WearableData.insertMany(wearableRecords);
  console.log(`✅ ${wearableRecords.length} registros de wearables insertados`);
}

// 5. Seed Chat Conversations
async function seedChatConversations(users, count = 50) {
  const ChatConversation = ChatConversationModel;
  const patients = users.filter(u => u.role === 'patient');
  const conversations = [];

  for (let i = 0; i < count; i++) {
    const patient = randomElement(patients);
    const messageCount = randomInt(3, 10);
    const messages = [];

    for (let j = 0; j < messageCount; j++) {
      messages.push({
        role: j % 2 === 0 ? 'user' : 'bot',
        content: j % 2 === 0 
          ? `Tengo ${randomElement(SYMPTOMS)} desde hace ${randomInt(1, 5)} días`
          : `Entiendo. Basado en tus síntomas, te recomiendo...`,
        timestamp: new Date(Date.now() - (count - i) * 60 * 60 * 1000 + j * 60000),
        metadata: {
          urgencyLevel: randomElement(['low', 'medium', 'high']),
          confidence: randomFloat(70, 95, 1),
          detectedDiseases: randomElements(SUSPECTED_DISEASES, randomInt(1, 3)),
          detectedSymptoms: randomElements(SYMPTOMS, randomInt(2, 4)),
        }
      });
    }

    const district = randomElement(DISTRICTS);
    const highestUrgency = randomElement(['very_low', 'low', 'medium', 'high', 'critical']);

    conversations.push({
      sessionId: uuidv4(),
      userId: patient._id.toString(),
      messages,
      userInfo: {
        name: patient.name,
        email: patient.email,
        age: randomInt(18, 80),
      },
      location: {
        district: district.name,
        city: 'Tacna',
        country: 'Perú'
      },
      metadata: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ipAddress: `192.168.1.${randomInt(1, 255)}`,
        language: 'es',
        source: randomElement(['web', 'mobile'])
      },
      summary: {
        totalMessages: messageCount,
        userMessages: Math.ceil(messageCount / 2),
        botMessages: Math.floor(messageCount / 2),
        detectedDiseases: randomElements(SUSPECTED_DISEASES, randomInt(1, 3)),
        detectedSymptoms: randomElements(SYMPTOMS, randomInt(2, 5)),
        highestUrgency,
        averageConfidence: randomFloat(75, 90, 1),
      },
      status: randomElement(['active', 'completed', 'abandoned']),
      requiresFollowUp: highestUrgency === 'high' || highestUrgency === 'critical',
      startedAt: new Date(Date.now() - (count - i) * 60 * 60 * 1000),
      lastActivityAt: new Date(Date.now() - (count - i) * 60 * 60 * 1000 + messageCount * 60000),
      completedAt: Math.random() > 0.3 ? new Date(Date.now() - (count - i) * 60 * 60 * 1000 + messageCount * 60000) : undefined,
    });
  }

  await ChatConversation.deleteMany({});
  await ChatConversation.insertMany(conversations);
  console.log(`✅ ${conversations.length} conversaciones de chat insertadas`);
}

// 6. Seed Appointments
async function seedAppointments(users) {
  const Appointment = AppointmentModel || mongoose.model('Appointment', new mongoose.Schema({}, { timestamps: true }));
  
  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');
  const appointments = [];

  // Citas pasadas
  for (let i = 0; i < 20; i++) {
    const patient = randomElement(patients);
    const doctor = randomElement(doctors);
    const scheduledAt = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));

    appointments.push({
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      createdBy: patient._id.toString(),
      scheduledAt,
      durationMinutes: randomInt(15, 60),
      status: randomElement(['completed', 'cancelled', 'no_show']),
      reason: `Consulta por ${randomElement(SYMPTOMS)}`,
      notes: scheduledAt < new Date() ? 'Consulta completada exitosamente' : undefined,
      location: {
        type: randomElement(['virtual', 'in_person']),
        address: randomElement(DISTRICTS).name + ', Tacna',
      },
      reminderSentAt: scheduledAt < new Date() ? new Date(scheduledAt.getTime() - 60 * 60 * 1000) : undefined,
    });
  }

  // Citas futuras
  for (let i = 0; i < 20; i++) {
    const patient = randomElement(patients);
    const doctor = randomElement(doctors);
    const scheduledAt = randomDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    appointments.push({
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      createdBy: patient._id.toString(),
      scheduledAt,
      durationMinutes: randomInt(15, 60),
      status: 'scheduled',
      reason: `Consulta de seguimiento`,
      location: {
        type: randomElement(['virtual', 'in_person']),
        address: randomElement(DISTRICTS).name + ', Tacna',
      },
    });
  }

  await Appointment.deleteMany({});
  await Appointment.insertMany(appointments);
  console.log(`✅ ${appointments.length} citas médicas insertadas`);
}

// 7. Seed Prescriptions ⭐ NUEVO
async function seedPrescriptions(users, appointments) {
  const Prescription = PrescriptionModel || mongoose.model('Prescription', new mongoose.Schema({}, { timestamps: true }));
  
  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');
  const prescriptions = [];

  // Crear prescripciones para algunos pacientes
  for (let i = 0; i < 25; i++) {
    const patient = randomElement(patients);
    const doctor = randomElement(doctors);
    const medicationCount = randomInt(1, 3);
    const medications = [];

    for (let j = 0; j < medicationCount; j++) {
      const med = randomElement(MEDICATIONS);
      medications.push({
        name: med.name,
        dosage: med.dosage,
        form: med.form,
        frequencyPerDay: med.frequency,
        durationDays: randomInt(5, 14),
        startDate: new Date(),
        instructions: `Tomar ${med.dosage} cada ${24 / med.frequency} horas`,
        reminderTimes: Array.from({ length: med.frequency }, (_, k) => `${8 + k * (24 / med.frequency)}:00`),
      });
    }

    // Generar interacciones si hay múltiples medicamentos
    const interactions = [];
    if (medications.length > 1) {
      if (Math.random() > 0.7) {
        interactions.push({
          medicationA: medications[0].name,
          medicationB: medications[1].name,
          severity: randomElement(['minor', 'moderate', 'major']),
          description: 'Posible interacción entre medicamentos',
          source: 'DrugBank',
        });
      }
    }

    const status = randomElement(['draft', 'pending_validation', 'active', 'completed', 'cancelled']);

    prescriptions.push({
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      createdBy: doctor._id.toString(),
      diagnosis: randomElement(DIAGNOSES),
      observations: `Prescripción para ${patient.name} con diagnóstico de ${randomElement(DIAGNOSES)}`,
      medications,
      interactions,
      status,
      validatedBy: status === 'active' || status === 'completed' ? doctor._id.toString() : undefined,
      validatedAt: status === 'active' || status === 'completed' ? new Date() : undefined,
      validationNotes: status === 'active' || status === 'completed' ? 'Prescripción validada' : undefined,
    });
  }

  await Prescription.deleteMany({});
  await Prescription.insertMany(prescriptions);
  console.log(`✅ ${prescriptions.length} prescripciones insertadas`);
}

// 8. Seed Alerts
async function seedAlerts(users) {
  const Alert = AlertModel || mongoose.model('Alert', new mongoose.Schema({}, { timestamps: true }));
  
  const allUsers = users;
  const alerts = [];

  const categories = ['critical_symptom', 'medication_reminder', 'follow_up', 'doctor_notification', 'system', 'emergency'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'scheduled', 'sent', 'delivered', 'failed', 'acknowledged'];

  for (let i = 0; i < 30; i++) {
    const user = randomElement(allUsers);
    const category = randomElement(categories);
    const priority = randomElement(priorities);
    const status = randomElement(statuses);

    alerts.push({
      userId: user._id.toString(),
      patientId: user.role === 'patient' ? user._id.toString() : undefined,
      doctorId: user.role === 'doctor' ? user._id.toString() : undefined,
      title: `Alerta: ${category.replace('_', ' ')}`,
      message: `Mensaje de alerta para ${user.name} sobre ${category}`,
      category,
      channels: randomElements(['in_app', 'push', 'email', 'sms'], randomInt(1, 3)),
      priority,
      status,
      trigger: {
        source: randomElement(['symptom_analysis', 'medication_schedule', 'follow_up_rule', 'manual', 'system']),
        referenceId: uuidv4(),
      },
      scheduledAt: status === 'scheduled' ? randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : new Date(),
      dispatchedAt: status === 'delivered' || status === 'sent' ? new Date() : undefined,
      acknowledgedAt: status === 'acknowledged' ? new Date() : undefined,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priorityWeight: priorities.indexOf(priority) + 1,
    });
  }

  await Alert.deleteMany({});
  await Alert.insertMany(alerts);
  console.log(`✅ ${alerts.length} alertas insertadas`);
}

// 9. Seed AI Analyses
async function seedAIAnalyses(medicalHistories) {
  const AIAnalysis = AIAnalysisModel || mongoose.model('AIAnalysis', new mongoose.Schema({}, { timestamps: true }));
  
  const analyses = [];

  for (const history of medicalHistories) {
    const historyId = history._id ? history._id.toString() : history.id;
    if (!historyId) continue;

    const possibleDiagnoses = randomElements(DIAGNOSES, randomInt(2, 4)).map((diagnosis, idx) => ({
      condition: diagnosis,
      probability: 100 - (idx * 20) + randomInt(-5, 5),
      recommendations: [
        `Recomendación 1 para ${diagnosis}`,
        `Recomendación 2 para ${diagnosis}`,
      ]
    }));

    analyses.push({
      medicalHistoryId: historyId,
      symptoms: history.symptoms || [],
      possibleDiagnoses,
      urgency: randomElement(['low', 'medium', 'high', 'critical']),
      confidence: randomFloat(80, 95, 1),
      timestamp: history.date || new Date(),
    });
  }

  await AIAnalysis.deleteMany({});
  await AIAnalysis.insertMany(analyses);
  console.log(`✅ ${analyses.length} análisis de IA insertados`);
}

// 10. Seed Automatic Reports ⭐ NUEVO
async function seedAutomaticReports(users) {
  const AutomaticReport = AutomaticReportModel || mongoose.model('AutomaticReport', new mongoose.Schema({}, { timestamps: true }));
  
  const admin = users.find(u => u.role === 'admin');
  const reports = [];
  const reportTypes = ['daily', 'weekly', 'monthly'];

  // Generar reportes de los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const reportType = i % 7 === 0 ? 'weekly' : (i % 30 === 0 ? 'monthly' : 'daily');
    const endDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate);
    
    if (reportType === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const status = i < 3 ? 'completed' : (i < 5 ? 'generating' : 'completed');
    
    reports.push({
      reportType,
      period: {
        startDate,
        endDate,
      },
      status,
      metrics: {
        totalPatients: randomInt(5, 10),
        totalDoctors: randomInt(2, 3),
        totalAdmins: 1,
        totalMedicalHistories: randomInt(10, 20),
        totalAlerts: randomInt(20, 40),
        criticalAlerts: randomInt(2, 8),
        totalAppointments: randomInt(15, 30),
        completedAppointments: randomInt(10, 25),
        aiAnalyses: randomInt(8, 15),
        averageAIConfidence: randomFloat(85, 92, 1),
        topDiagnoses: randomElements(DIAGNOSES, 5).map(d => ({
          diagnosis: d,
          count: randomInt(5, 20)
        })),
        symptomCategories: [
          { category: 'respiratory', total: randomInt(50, 100) },
          { category: 'fever', total: randomInt(20, 40) },
          { category: 'pain', total: randomInt(10, 30) },
        ],
        districtDistribution: DISTRICTS.slice(0, 5).map(d => ({
          district: d.name,
          count: randomInt(10, 50)
        })),
        growthMetrics: {
          patientsGrowth: randomFloat(-5, 15, 1),
          historiesGrowth: randomFloat(-10, 20, 1),
          alertsGrowth: randomFloat(-15, 25, 1),
        },
      },
      anomalies: Math.random() > 0.7 ? [{
        metric: 'criticalAlerts',
        value: randomInt(10, 20),
        expectedRange: { min: 0, max: 5 },
        severity: randomElement(['medium', 'high', 'critical']),
        description: 'Número de alertas críticas por encima del rango esperado',
        detectedAt: endDate,
      }] : [],
      filePath: status === 'completed' ? `/reports/${reportType}-${endDate.toISOString().split('T')[0]}.pdf` : undefined,
      exportedAt: status === 'completed' ? endDate : undefined,
      exportFormat: status === 'completed' ? randomElement(['pdf', 'csv', 'json']) : undefined,
      generatedBy: admin ? admin._id.toString() : undefined,
      generatedAt: endDate,
    });
  }

  await AutomaticReport.deleteMany({});
  await AutomaticReport.insertMany(reports);
  console.log(`✅ ${reports.length} reportes automáticos insertados`);
}

// 11. Seed ML Experiments ⭐ NUEVO
async function seedMLExperiments(users) {
  // Crear schema completo para MLExperiment
  const MLExperimentSchema = new mongoose.Schema({
    experimentId: { type: String, required: true, unique: true, index: true },
    experimentType: {
      type: String,
      enum: ['rl_session', 'fl_round', 'automl_pipeline', 'prediction', 'training', 'evaluation'],
      required: true,
      index: true
    },
    modelName: { type: String, required: true, index: true },
    modelVersion: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    logs: { type: [mongoose.Schema.Types.Mixed], default: [] },
    errors: { type: [mongoose.Schema.Types.Mixed], default: [] },
    performance: {
      startTime: { type: Date, default: Date.now },
      endTime: Date,
      durationMs: Number,
      cpuUsage: Number,
      memoryUsage: Number,
      gpuUsage: Number
    },
    results: { type: mongoose.Schema.Types.Mixed }
  }, {
    timestamps: true,
    collection: 'mlexperiments'
  });
  
  const MLExperiment = MLExperimentModel || mongoose.model('MLExperiment', MLExperimentSchema);
  
  const experiments = [];
  const experimentTypes = ['prediction', 'training', 'evaluation', 'rl_session', 'fl_round'];
  const modelNames = ['XGBoost', 'Random Forest', 'Neural Network'];
  const modelVersions = ['1.2.0', '2.1.0', '1.0.0'];
  const statuses = ['completed', 'completed', 'completed', 'running', 'failed']; // Más completados

  for (let i = 0; i < 25; i++) {
    const experimentType = randomElement(experimentTypes);
    const modelIndex = i % modelNames.length;
    const modelName = modelNames[modelIndex];
    const modelVersion = modelVersions[modelIndex];
    const status = i < 20 ? 'completed' : (i < 23 ? 'running' : 'failed');
    const startTime = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const duration = randomInt(1, 120) * 60 * 1000; // 1 min a 2 horas
    const endTime = status === 'completed' || status === 'failed' 
      ? new Date(startTime.getTime() + duration)
      : undefined;

    const numSamples = randomInt(50, 1000);
    const selectedSymptoms = randomElements(SYMPTOMS, randomInt(3, 6));
    const predictedDisease = randomElement(SUSPECTED_DISEASES);
    const confidence = status === 'completed' ? randomFloat(70, 95, 1) : randomFloat(40, 70, 1);

    experiments.push({
      experimentId: `exp-${modelName.toLowerCase().replace(' ', '-')}-${Date.now()}-${i}`,
      experimentType,
      modelName,
      modelVersion,
      status,
      metadata: {
        userId: randomElement(users.filter(u => u.role === 'patient'))._id.toString(),
        sessionId: uuidv4(),
        environment: 'development',
        modelType: modelName === 'Neural Network' ? 'neural_network' : (modelName === 'XGBoost' ? 'gradient_boosting' : 'ensemble'),
        roundNumber: experimentType === 'fl_round' ? randomInt(1, 10) : undefined,
      },
      inputs: {
        symptoms: selectedSymptoms,
        patient_age: randomInt(10, 70),
        num_samples: numSamples,
        features: selectedSymptoms.length,
        training_data: {
          samples: numSamples,
          features: selectedSymptoms.length,
          distribution: {
            asma: randomFloat(0.2, 0.3, 2),
            neumonia: randomFloat(0.15, 0.25, 2),
            bronquitis: randomFloat(0.2, 0.3, 2),
            covid19: randomFloat(0.1, 0.2, 2),
            gripe: randomFloat(0.05, 0.15, 2)
          }
        },
        hyperparameters: experimentType === 'training' ? {
          learningRate: randomFloat(0.001, 0.1, 4),
          batchSize: randomInt(16, 64),
          epochs: randomInt(10, 50),
        } : undefined,
      },
      outputs: status === 'completed' ? {
        prediction: {
          disease: predictedDisease,
          confidence: confidence,
          urgency_level: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'
        },
        metrics: {
          accuracy: randomFloat(85, 99, 2),
          precision: randomFloat(82, 97, 2),
          recall: randomFloat(80, 96, 2),
          f1: randomFloat(81, 96, 2),
          loss: randomFloat(0.1, 0.25, 3)
        },
        shap_values: selectedSymptoms.map(s => ({
          feature: s,
          importance: randomFloat(0.1, 1.0, 3)
        })).sort((a, b) => b.importance - a.importance)
      } : (status === 'running' ? {
        prediction: {
          disease: predictedDisease,
          confidence: confidence,
          urgency_level: 'medium'
        }
      } : {}),
      logs: Array.from({ length: randomInt(5, 15) }, (_, j) => ({
        timestamp: new Date(startTime.getTime() + (duration / 10) * j),
        level: randomElement(['info', 'debug', 'warning']),
        message: `Step ${j + 1}: Processing ${numSamples} samples`,
        data: { step: j + 1, samples_processed: Math.floor((numSamples / 10) * (j + 1)) },
      })),
      errors: status === 'failed' ? [{
        timestamp: new Date(startTime.getTime() + randomInt(1, 10) * 60000),
        error: 'Model convergence failed',
        stack: 'Error: Model convergence failed\n    at TrainingStep.execute',
        context: { iteration: randomInt(1, 100), loss: 0.5 },
      }] : [],
      performance: {
        startTime,
        endTime,
        durationMs: endTime ? endTime.getTime() - startTime.getTime() : undefined,
        cpuUsage: randomFloat(20, 80, 1),
        memoryUsage: randomFloat(1024, 3072, 0), // MB
        gpuUsage: experimentType === 'training' && modelName === 'Neural Network' ? randomFloat(30, 95, 1) : undefined,
      },
      results: status === 'completed' ? {
        summary: `Experiment completed successfully with ${numSamples} samples`,
        insights: [
          `Model ${modelName} achieved ${(randomFloat(85, 99, 1)).toFixed(1)}% accuracy`,
          `Most important feature: ${selectedSymptoms[0]}`,
          `Predicted disease: ${predictedDisease} with ${(confidence * 100).toFixed(1)}% confidence`
        ],
        recommendations: [
          'Model performance is within acceptable range',
          'Consider retraining with more diverse data',
          'Monitor predictions for edge cases'
        ],
        nextSteps: [
          'Deploy model to production',
          'Set up monitoring alerts',
          'Schedule next evaluation in 7 days'
        ]
      } : undefined,
      createdAt: startTime,
      updatedAt: endTime || new Date()
    });
  }

  await MLExperiment.deleteMany({});
  await MLExperiment.insertMany(experiments);
  console.log(`✅ ${experiments.length} experimentos ML insertados con datos realistas`);
}

// 12. Seed Audit Logs ⭐ NUEVO
async function seedAuditLogs(users) {
  const AuditLog = AuditLogModel || mongoose.model('AuditLog', new mongoose.Schema({}, { timestamps: true }));
  
  const logs = [];
  const statusCodes = [200, 201, 400, 401, 403, 404, 500];

  // Generar logs de los últimos 7 días
  for (let i = 0; i < 200; i++) {
    const user = Math.random() > 0.3 ? randomElement(users) : null;
    const method = randomElement(HTTP_METHODS);
    const route = randomElement(ROUTES);
    const statusCode = randomElement(statusCodes);
    const timestamp = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());

    logs.push({
      userId: user ? user._id.toString() : undefined,
      method,
      route,
      statusCode,
      ip: `192.168.1.${randomInt(1, 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      payloadHash: `hash-${uuidv4()}`,
      redactedPayload: {
        method,
        route,
        timestamp: timestamp.toISOString(),
      },
      createdAt: timestamp,
    });
  }

  await AuditLog.deleteMany({});
  await AuditLog.insertMany(logs);
  console.log(`✅ ${logs.length} logs de auditoría insertados`);
}

// 13. Seed Consent Logs ⭐ NUEVO
async function seedConsentLogs(users) {
  const ConsentLog = ConsentLogModel || mongoose.model('ConsentLog', new mongoose.Schema({}, { timestamps: true }));
  
  const consentLogs = [];
  const consentTypes = ['privacy_policy', 'terms_of_service', 'data_processing', 'marketing', 'analytics'];

  for (const user of users) {
    const consentCount = randomInt(1, 3);
    const consents = [];

    for (let i = 0; i < consentCount; i++) {
      consents.push({
        id: randomElement(consentTypes),
        accepted: Math.random() > 0.1, // 90% aceptan
        timestamp: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
      });
    }

    const timestamp = new Date(Math.min(...consents.map(c => c.timestamp.getTime())));
    const revokedAt = Math.random() > 0.8 ? new Date(timestamp.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000) : undefined;

    consentLogs.push({
      userId: user._id.toString(),
      consents,
      version: '1.0',
      ipAddress: `192.168.1.${randomInt(1, 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp,
      revokedAt,
      revokedReason: revokedAt ? 'Usuario revocó consentimiento' : undefined,
    });
  }

  await ConsentLog.deleteMany({});
  await ConsentLog.insertMany(consentLogs);
  console.log(`✅ ${consentLogs.length} logs de consentimiento insertados`);
}

// Main seed function
async function seedCompleteSystem() {
  try {
    console.log('🌱 Iniciando seed completo del sistema...\n');
    
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Conectado a MongoDB\n');

    // 1. Seed Users
    const users = await seedUsers();
    console.log('');

    // 2. Seed Symptom Reports
    await seedSymptomReports(900);
    console.log('');

    // 3. Seed Medical Histories
    const medicalHistories = await seedMedicalHistories(users);
    console.log('');

    // 4. Seed Wearable Data
    await seedWearableData(users);
    console.log('');

    // 5. Seed Chat Conversations
    await seedChatConversations(users, 50);
    console.log('');

    // 6. Seed Appointments
    const appointments = await seedAppointments(users);
    console.log('');

    // 7. Seed Prescriptions ⭐ NUEVO
    await seedPrescriptions(users, appointments);
    console.log('');

    // 8. Seed Alerts
    await seedAlerts(users);
    console.log('');

    // 9. Seed AI Analyses
    await seedAIAnalyses(medicalHistories);
    console.log('');

    // 10. Seed Automatic Reports ⭐ NUEVO
    await seedAutomaticReports(users);
    console.log('');

    // 11. Seed ML Experiments ⭐ NUEVO
    await seedMLExperiments(users);
    console.log('');

    // 12. Seed Audit Logs ⭐ NUEVO
    await seedAuditLogs(users);
    console.log('');

    // 13. Seed Consent Logs ⭐ NUEVO
    await seedConsentLogs(users);
    console.log('');

    // Final Statistics
    console.log('📊 Estadísticas finales:');
    const stats = {
      users: await (UserModel || mongoose.model('User')).countDocuments(),
      symptomReports: await SymptomReportModel.countDocuments(),
      medicalHistories: await (MedicalHistoryModel || mongoose.model('MedicalHistory')).countDocuments(),
      wearableData: await (WearableDataModel || mongoose.model('WearableData')).countDocuments(),
      chatConversations: await ChatConversationModel.countDocuments(),
      appointments: await (AppointmentModel || mongoose.model('Appointment')).countDocuments(),
      prescriptions: await (PrescriptionModel || mongoose.model('Prescription')).countDocuments(),
      alerts: await (AlertModel || mongoose.model('Alert')).countDocuments(),
      aiAnalyses: await (AIAnalysisModel || mongoose.model('AIAnalysis')).countDocuments(),
      automaticReports: await (AutomaticReportModel || mongoose.model('AutomaticReport')).countDocuments(),
      mlExperiments: await (MLExperimentModel || mongoose.model('MLExperiment')).countDocuments(),
      auditLogs: await (AuditLogModel || mongoose.model('AuditLog')).countDocuments(),
      consentLogs: await (ConsentLogModel || mongoose.model('ConsentLog')).countDocuments(),
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key.padEnd(20)}: ${value.toString().padStart(6)} documentos`);
    });

    console.log('\n✅ Seed completo del sistema finalizado exitosamente!');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Pacientes: paciente@demo.com, juan.perez@demo.com, etc. / demo1234');
    console.log('   Doctores: doctor@demo.com, laura.martinez@demo.com / demo1234');
    console.log('   Admin: admin@demo.com / admin1234');
    console.log('\n📝 Todas las colecciones han sido pobladas con datos de prueba.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Run if executed directly
if (require.main === module) {
  seedCompleteSystem();
}

module.exports = { seedCompleteSystem };

