/**
 * Seed de datos demo para dashboards, tendencias y explicabilidad.
 * Genera usuarios básicos y ~100 casos distribuidos en reportes de síntomas,
 * historiales médicos, análisis IA, citas y alertas.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import UserModel, { UserDocument } from '../models/User';
import MedicalHistoryModel from '../models/MedicalHistory';
import AppointmentModel from '../models/Appointment';
import AlertModel from '../models/Alert';
import AIAnalysisModel from '../models/AIAnalysis';

// Modelo en JS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SymptomReportModel = require('../models/SymptomReport');

dotenv.config();

const ensureEnv = (key: string, fallback: string) => {
  if (!process.env[key]) {
    process.env[key] = fallback;
  }
};

ensureEnv('NODE_ENV', 'development');
ensureEnv('PORT', '3001');
ensureEnv('MONGO_USERNAME', 'admin');
ensureEnv('MONGO_PASSWORD', 'change_this_password');
ensureEnv('MONGODB_URI', `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@localhost:27017/?authSource=admin`);
ensureEnv('MONGO_DB', 'respicare_dev');
ensureEnv('JWT_SECRET', 'demo-secret');
ensureEnv('JWT_REFRESH_SECRET', 'demo-refresh-secret');
ensureEnv('REDIS_URL', 'redis://localhost:6379');
ensureEnv('SMTP_HOST', 'smtp.example.com');
ensureEnv('SMTP_PORT', '587');
ensureEnv('SMTP_USER', 'demo@example.com');
ensureEnv('SMTP_PASS', 'demo-password');
ensureEnv('PUSH_PROVIDER', 'none');

const SEED_MARKER = '[DEMO]';

const DISTRICTS = [
  {
    name: 'Centro de Tacna',
    lat: -18.0056,
    lng: -70.2444,
  },
  {
    name: 'Gregorio Albarracín',
    lat: -18.0303,
    lng: -70.2489,
  },
  {
    name: 'Ciudad Nueva',
    lat: -18.0123,
    lng: -70.2305,
  },
  {
    name: 'Pocollay',
    lat: -17.995,
    lng: -70.21,
  },
  {
    name: 'Alto de la Alianza',
    lat: -17.97,
    lng: -70.24,
  },
  {
    name: 'Calana',
    lat: -17.96,
    lng: -70.195,
  },
  {
    name: 'Pachia',
    lat: -17.92,
    lng: -70.185,
  },
  {
    name: 'Boca del Río',
    lat: -18.04,
    lng: -70.28,
  },
];

const SYMPTOMS = [
  'Tos seca',
  'Tos con flema',
  'Dificultad respiratoria',
  'Fiebre',
  'Dolor de cabeza',
  'Fatiga',
  'Dolor en el pecho',
  'Congestión nasal',
  'Dolor muscular',
  'Dolor de garganta',
  'Sibilancias',
  'Sudoración nocturna',
  'Escalofríos',
  'Pérdida de apetito',
  'Náuseas',
];

const DIAGNOSES = [
  'Asma',
  'Bronquitis aguda',
  'Neumonía',
  'COVID-19',
  'Gripe estacional',
  'Resfriado común',
  'EPOC',
  'Sinusitis',
  'Faringitis',
  'Alérgia respiratoria',
];

const DISEASE_TO_CATEGORY: Record<string, string> = {
  asma: 'respiratory',
  bronquitis: 'respiratory',
  neumonia: 'respiratory',
  covid19: 'respiratory',
  gripe: 'fever',
  epoc: 'respiratory',
  resfriado: 'respiratory',
  unknown: 'respiratory',
};

const SYMPTOM_CATEGORY_OPTIONS = ['respiratory', 'fever', 'pain', 'digestive', 'fatigue', 'neurological'] as const;
const SEVERITIES = ['mild', 'moderate', 'severe'] as const;
const OVERALL_SEVERITIES = ['low', 'medium', 'high'] as const;
const ALERT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const ALERT_STATUSES = ['pending', 'scheduled', 'sent', 'delivered', 'acknowledged', 'failed'] as const;
const ALERT_CATEGORIES = ['critical_symptom', 'medication_reminder', 'follow_up', 'doctor_notification', 'system'] as const;
const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'] as const;

const randomItem = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2): number => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const randomDateWithinDays = (days: number): Date => {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  return new Date(randomInt(past, now));
};

const randomDuration = (): string => {
  const units = ['horas', 'días', 'semanas'];
  return `${randomInt(1, 7)} ${randomItem(units)}`;
};

const getObjectId = (value: unknown): string => {
  if (!value) {
    throw new Error('Documento sin identificador');
  }
  if (typeof value === 'string') return value;
  if (typeof (value as any).toString === 'function') {
    return (value as any).toString();
  }
  return String(value);
};

const generateName = (): string => {
  const firstNames = ['Juan', 'María', 'Luis', 'Ana', 'Carlos', 'Rosa', 'Miguel', 'Lucía', 'Pedro', 'Elena', 'Sofía', 'Diego', 'Valeria', 'Jorge', 'Camila'];
  const lastNames = ['Pérez', 'García', 'Mamani', 'Flores', 'Gutiérrez', 'Loayza', 'Torres', 'Quispe', 'Ruiz', 'Sánchez', 'Vargas', 'Acosta', 'Castro', 'Fernández'];
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
};

const mapDiseaseToKey = (diagnosis: string): string => {
  const lower = diagnosis.toLowerCase();
  if (lower.includes('asma')) return 'asma';
  if (lower.includes('bronqu')) return 'bronquitis';
  if (lower.includes('neum')) return 'neumonia';
  if (lower.includes('cov')) return 'covid19';
  if (lower.includes('gripe')) return 'gripe';
  if (lower.includes('epoc')) return 'epoc';
  if (lower.includes('resfri')) return 'resfriado';
  return 'unknown';
};

const calculateOverallSeverity = (symptomSeverities: string[]): typeof OVERALL_SEVERITIES[number] => {
  const severeCount = symptomSeverities.filter((severity) => severity === 'severe').length;
  const moderateCount = symptomSeverities.filter((severity) => severity === 'moderate').length;

  if (severeCount >= 2 || (severeCount === 1 && moderateCount >= 2)) {
    return 'high';
  }
  if (severeCount === 1 || moderateCount >= 2) {
    return 'medium';
  }
  return 'low';
};

async function connectDatabase(): Promise<void> {
  const dbName = process.env.MONGO_DB || 'respicare_dev';
  const candidates = [
    process.env.MONGODB_URI,
    `mongodb://${process.env.MONGO_USERNAME || 'admin'}:${process.env.MONGO_PASSWORD || 'change_this_password'}@localhost:27017/${dbName}?authSource=admin`,
    `mongodb://${process.env.MONGO_USERNAME || 'admin'}:${process.env.MONGO_PASSWORD || 'change_this_password'}@127.0.0.1:27017/${dbName}?authSource=admin`,
    `mongodb://localhost:27017/${dbName}`,
  ].filter((uri): uri is string => Boolean(uri));

  let lastError: unknown;

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        dbName,
      });
      logger.info('✅ Conectado a MongoDB', { uri: uri.replace(/\/\/[^@]+@/, '//***@') });
      return;
    } catch (error) {
      lastError = error;
      logger.warn('No se pudo conectar con la cadena proporcionada', {
        uri: uri.replace(/\/\/[^@]+@/, '//***@'),
        error,
      });
      await mongoose.disconnect().catch(() => undefined);
    }
  }

  throw lastError ?? new Error('No fue posible conectarse a MongoDB con las cadenas de conexión probadas');
}

async function cleanupPreviousDemoData(): Promise<void> {
  logger.info('🧹 Limpiando datos demo anteriores');

  const previousHistories = await MedicalHistoryModel.find({ description: { $regex: SEED_MARKER } }, '_id').lean();
  if (previousHistories.length > 0) {
    const historyIds = previousHistories.map((item) => item._id.toString());
    await AIAnalysisModel.deleteMany({ medicalHistoryId: { $in: historyIds } });
  }

  await Promise.all([
    MedicalHistoryModel.deleteMany({ description: { $regex: SEED_MARKER } }),
    SymptomReportModel.deleteMany({ notes: { $regex: SEED_MARKER } }),
    AppointmentModel.deleteMany({ 'metadata.seedTag': SEED_MARKER }),
    AlertModel.deleteMany({ 'metadata.seedTag': SEED_MARKER }),
  ]);
}

async function ensureUsers(): Promise<{
  doctors: UserDocument[];
  patients: UserDocument[];
  admin: UserDocument;
}> {
  const doctorEmails = [
    'doctor.demo1@respicare.com',
    'doctor.demo2@respicare.com',
    'doctor.demo3@respicare.com',
    'doctor.demo4@respicare.com',
  ];

  const patientEmails = Array.from({ length: 20 }).map((_, index) => `paciente.demo${index + 1}@respicare.com`);

  const adminEmail = 'admin.demo@respicare.com';

  const ensureUser = async (email: string, role: 'doctor' | 'patient' | 'admin'): Promise<UserDocument> => {
    let user = await UserModel.findOne({ email });
    if (!user) {
      const name = generateName();
      const password = await bcrypt.hash('demo1234', 10);
      user = new UserModel({
        name,
        email,
        password,
        role,
        isActive: true,
        lastLogin: randomDateWithinDays(10),
      });
      await user.save();
    }
    return user;
  };

  const doctors = await Promise.all(doctorEmails.map((email) => ensureUser(email, 'doctor')));
  const patients = await Promise.all(patientEmails.map((email) => ensureUser(email, 'patient')));
  const admin = await ensureUser(adminEmail, 'admin');

  return { doctors, patients, admin };
}

type DoctorPatientContext = {
  doctors: UserDocument[];
  patients: UserDocument[];
};

function buildSymptomList(): Array<{ name: string; severity: string; duration: string; description?: string }> {
  const symptomCount = randomInt(2, 5);
  const selected = new Set<string>();
  const symptoms = [];

  while (symptoms.length < symptomCount) {
    const symptomName = randomItem(SYMPTOMS);
    if (selected.has(symptomName)) continue;
    selected.add(symptomName);
    const severity = randomItem(SEVERITIES);
    symptoms.push({
      name: symptomName,
      severity,
      duration: randomDuration(),
      description: `Síntoma ${severity} reportado por el paciente`,
    });
  }

  return symptoms;
}

async function seedSymptomReports(count: number, context: DoctorPatientContext): Promise<number> {
  const reports: any[] = [];

  for (let index = 0; index < count; index += 1) {
    const patient = randomItem(context.patients);
    const doctor = randomItem(context.doctors);
    const district = randomItem(DISTRICTS);
    const createdAt = randomDateWithinDays(45);
    const symptomList = buildSymptomList();
    const symptomSeverities = symptomList.map((item) => item.severity);
    const overallSeverity = calculateOverallSeverity(symptomSeverities);

    const diagnosisKey = randomItem(['asma', 'bronquitis', 'neumonia', 'covid19', 'gripe', 'epoc', 'resfriado']);
    const category = DISEASE_TO_CATEGORY[diagnosisKey] ?? randomItem(SYMPTOM_CATEGORY_OPTIONS);

    reports.push({
      patientId: getObjectId(patient._id),
      location: {
        district: district.name,
        coordinates: {
          latitude: district.lat + randomFloat(-0.01, 0.01, 4),
          longitude: district.lng + randomFloat(-0.01, 0.01, 4),
        },
        address: `${district.name}, Tacna`,
      },
      symptoms: symptomList,
      category,
      overallSeverity,
      suspectedDisease: diagnosisKey,
      temperature: randomFloat(36, 40, 1),
      oxygenSaturation: randomInt(88, 99),
      hasPreexistingConditions: Math.random() < 0.35,
      preexistingConditions: Math.random() < 0.35 ? ['hipertensión', 'asma'] : [],
      contactInfo: {
        phone: `+5196${randomInt(1000000, 9999999)}`,
        email: patient.email,
      },
      status: randomItem(['pending', 'reviewed', 'urgent', 'resolved'] as const),
      medicalAttentionRequired: overallSeverity === 'high',
      medicalAttentionReceived: overallSeverity !== 'high' ? Math.random() < 0.6 : Math.random() < 0.85,
      notes: `Caso generado automáticamente ${SEED_MARKER}`,
      reportedBy: randomItem(['patient', 'family', 'healthcare_worker', 'anonymous'] as const),
      source: randomItem(['web', 'mobile', 'hospital'] as const),
      isAnonymous: Math.random() < 0.2,
      doctorId: getObjectId(doctor._id),
      createdAt,
      updatedAt: createdAt,
    });
  }

  if (reports.length === 0) return 0;
  await SymptomReportModel.insertMany(reports, { ordered: false });
  return reports.length;
}

async function seedMedicalHistories(count: number, context: DoctorPatientContext): Promise<string[]> {
  const histories: any[] = [];

  for (let index = 0; index < count; index += 1) {
    const patient = randomItem(context.patients);
    const doctor = randomItem(context.doctors);
    const district = randomItem(DISTRICTS);
    const createdAt = randomDateWithinDays(90);

    const symptoms = buildSymptomList();
    const diagnosis = randomItem(DIAGNOSES);
    const diagnosisKey = mapDiseaseToKey(diagnosis);

    histories.push({
      patientId: getObjectId(patient._id),
      doctorId: getObjectId(doctor._id),
      patientName: patient.name ?? generateName(),
      age: randomInt(5, 85),
      diagnosis,
      symptoms: symptoms.map((item) => ({
        name: item.name,
        severity: item.severity,
        duration: item.duration,
        description: item.description,
      })),
      description: `Registro clínico generado para demo ${SEED_MARKER}`,
      date: createdAt,
      location: {
        latitude: district.lat + randomFloat(-0.02, 0.02, 4),
        longitude: district.lng + randomFloat(-0.02, 0.02, 4),
        address: `${district.name}, Tacna`,
      },
      images: [],
      audioNotes: undefined,
      isOffline: Math.random() < 0.1,
      syncStatus: Math.random() < 0.85 ? 'synced' : randomItem(['pending', 'error'] as const),
      createdAt,
      updatedAt: createdAt,
      metadata: {
        category: DISEASE_TO_CATEGORY[diagnosisKey] ?? randomItem(SYMPTOM_CATEGORY_OPTIONS),
      },
    });
  }

  if (histories.length === 0) return [];
  const inserted = await MedicalHistoryModel.insertMany(histories, { ordered: false });
  return inserted.map((doc) => getObjectId(doc._id));
}

async function seedAIAnalyses(medicalHistoryIds: string[]): Promise<number> {
  if (!medicalHistoryIds.length) return 0;

  const histories = await MedicalHistoryModel.find({ _id: { $in: medicalHistoryIds } })
    .select(['_id', 'diagnosis', 'symptoms', 'date'])
    .lean();

  const analyses: any[] = [];

  histories.forEach((history) => {
    const analysisCount = randomInt(1, 3);
    for (let index = 0; index < analysisCount; index += 1) {
      const timestamp = new Date((history.date as Date).getTime() + randomInt(0, 4) * 60 * 60 * 1000);
      const urgency = randomItem(URGENCY_LEVELS);
      analyses.push({
        medicalHistoryId: history._id.toString(),
        symptoms: (history.symptoms || []).map((symptom: any) => ({
          name: symptom.name,
          severity: symptom.severity,
          duration: symptom.duration,
          description: symptom.description,
        })),
        possibleDiagnoses: [
          {
            condition: history.diagnosis,
            probability: randomInt(60, 95),
            recommendations: [
              'Seguimiento médico en las próximas 48h',
              'Mantener hidratación adecuada',
              'Registrar síntomas en la aplicación',
            ],
          },
          {
            condition: randomItem(DIAGNOSES),
            probability: randomInt(20, 55),
            recommendations: ['Monitoreo domiciliario', 'Consultar si empeoran síntomas'],
          },
        ],
        urgency,
        confidence: randomInt(55, 98),
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  });

  if (!analyses.length) return 0;
  await AIAnalysisModel.insertMany(analyses, { ordered: false });
  return analyses.length;
}

async function seedAppointments(count: number, context: DoctorPatientContext): Promise<number> {
  const appointments: any[] = [];

  for (let index = 0; index < count; index += 1) {
    const patient = randomItem(context.patients);
    const doctor = randomItem(context.doctors);
    const scheduledAt = randomDateWithinDays(30);
    const status = randomItem(APPOINTMENT_STATUSES);

    appointments.push({
      patientId: getObjectId(patient._id),
      doctorId: getObjectId(doctor._id),
      createdBy: getObjectId(doctor._id),
      scheduledAt,
      durationMinutes: randomItem([30, 45, 60]),
      status,
      reason: randomItem([
        'Control respiratorio',
        'Seguimiento post tratamiento',
        'Evaluación de síntomas persistentes',
        'Consulta preventiva',
      ]),
      notes: status === 'completed' ? `Cita completada sin complicaciones ${SEED_MARKER}` : undefined,
      location: {
        type: randomItem(['in_person', 'virtual'] as const),
        description: 'Consultorio Central',
        meetingLink: 'https://meet.respicare/demo',
        address: 'Av. San Martín 123, Tacna',
      },
      reminderMinutesBefore: randomItem([30, 60, 120]),
      tags: ['demo', 'seguimiento'],
      metadata: {
        seedTag: SEED_MARKER,
        generatedAt: new Date(),
      },
      createdAt: scheduledAt,
      updatedAt: scheduledAt,
    });
  }

  if (!appointments.length) return 0;
  await AppointmentModel.insertMany(appointments, { ordered: false });
  return appointments.length;
}

async function seedAlerts(count: number, context: DoctorPatientContext): Promise<number> {
  const alerts: any[] = [];

  for (let index = 0; index < count; index += 1) {
    const patient = randomItem(context.patients);
    const doctor = randomItem(context.doctors);
    const createdAt = randomDateWithinDays(20);
    const status = randomItem(ALERT_STATUSES);
    const priority = randomItem(ALERT_PRIORITIES);

    alerts.push({
      userId: getObjectId(patient._id),
      patientId: getObjectId(patient._id),
      doctorId: getObjectId(doctor._id),
      title: `Alerta de seguimiento ${randomItem(['crítico', 'prioritario', 'programado'])}`,
      message: 'Revise los síntomas reportados y confirme atención médica si es necesario.',
      category: randomItem(ALERT_CATEGORIES),
      channels: ['push', 'in_app'],
      priority,
      status,
      trigger: {
        source: randomItem(['symptom_analysis', 'manual', 'doctor_portal'] as const),
        referenceId: `ref-${randomInt(1000, 9999)}`,
        metadata: { severity: priority, doctor: doctor.name },
      },
      metadata: {
        seedTag: SEED_MARKER,
        generatedAt: new Date(),
      },
      tags: ['demo', 'seguimiento'],
      scheduledAt: createdAt,
      dispatchedAt: status === 'delivered' ? new Date(createdAt.getTime() + 15 * 60 * 1000) : undefined,
      acknowledgedAt: status === 'acknowledged' ? new Date(createdAt.getTime() + 30 * 60 * 1000) : undefined,
      expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      retries: status === 'failed' ? randomInt(1, 3) : 0,
      lastError: status === 'failed' ? 'Simulación de error de canal' : undefined,
      createdAt,
      updatedAt: createdAt,
    });
  }

  if (!alerts.length) return 0;
  await AlertModel.insertMany(alerts, { ordered: false });
  return alerts.length;
}

async function seedDemoData(): Promise<void> {
  logger.info('🌱 Iniciando seed demo');
  await connectDatabase();
  await cleanupPreviousDemoData();

  const { doctors, patients } = await ensureUsers();
  logger.info(`👩‍⚕️ Doctores disponibles: ${doctors.length}`);
  logger.info(`🧑 Pacientes disponibles: ${patients.length}`);

  const context: DoctorPatientContext = { doctors, patients };

  const [reportsCreated, historyIds] = await Promise.all([
    seedSymptomReports(120, context),
    seedMedicalHistories(80, context),
  ]);

  const [analysesCreated, appointmentsCreated, alertsCreated] = await Promise.all([
    seedAIAnalyses(historyIds),
    seedAppointments(60, context),
    seedAlerts(50, context),
  ]);

  logger.info('✅ Datos demo generados correctamente', {
    symptomReports: reportsCreated,
    medicalHistories: historyIds.length,
    aiAnalyses: analysesCreated,
    appointments: appointmentsCreated,
    alerts: alertsCreated,
  });
}

if (require.main === module) {
  seedDemoData()
    .then(() => {
      logger.info('🎉 Seed demo completado');
      return mongoose.connection.close();
    })
    .then(() => {
      logger.info('🔌 Conexión cerrada');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Error ejecutando seed demo', { error });
      mongoose.connection.close().finally(() => process.exit(1));
    });
}

export default seedDemoData;


