import mongoose, { Document, Schema } from 'mongoose';
import { MedicalHistory as IMedicalHistory, Symptom } from '../types';

export interface MedicalHistoryDocument extends IMedicalHistory, Document {
  toJSON(): any;
}

const SymptomSchema = new Schema<Symptom>({
  name: {
    type: String,
    required: [true, 'El nombre del síntoma es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre del síntoma no puede exceder 100 caracteres']
  },
  severity: {
    type: String,
    enum: {
      values: ['mild', 'moderate', 'severe'],
      message: 'La severidad debe ser mild, moderate o severe'
    },
    required: [true, 'La severidad del síntoma es obligatoria']
  },
  duration: {
    type: String,
    required: [true, 'La duración del síntoma es obligatoria'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  }
}, { _id: true });

const MedicalHistorySchema = new Schema<MedicalHistoryDocument>({
  patientId: {
    type: String,
    required: [true, 'El ID del paciente es obligatorio'],
    trim: true
  },
  doctorId: {
    type: String,
    required: [true, 'El ID del doctor es obligatorio'],
    trim: true
  },
  patientName: {
    type: String,
    required: [true, 'El nombre del paciente es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre del paciente no puede exceder 100 caracteres']
  },
  age: {
    type: Number,
    required: [true, 'La edad es obligatoria'],
    min: [0, 'La edad no puede ser negativa'],
    max: [150, 'La edad no puede exceder 150 años']
  },
  diagnosis: {
    type: String,
    required: [true, 'El diagnóstico es obligatorio'],
    trim: true,
    maxlength: [200, 'El diagnóstico no puede exceder 200 caracteres']
  },
  symptoms: {
    type: [SymptomSchema],
    default: [],
    validate: {
      validator: function(symptoms: Symptom[]) {
        return symptoms.length <= 20; // Máximo 20 síntomas
      },
      message: 'No se pueden registrar más de 20 síntomas'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  date: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    default: Date.now
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'La latitud debe estar entre -90 y 90'],
      max: [90, 'La latitud debe estar entre -90 y 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'La longitud debe estar entre -180 y 180'],
      max: [180, 'La longitud debe estar entre -180 y 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'La dirección no puede exceder 200 caracteres']
    }
  },
  images: [{
    type: String,
    trim: true
  }],
  audioNotes: {
    type: String,
    trim: true
  },
  isOffline: {
    type: Boolean,
    default: false
  },
  syncStatus: {
    type: String,
    enum: {
      values: ['pending', 'synced', 'error'],
      message: 'El estado de sincronización debe ser pending, synced o error'
    },
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
MedicalHistorySchema.index({ patientId: 1 });
MedicalHistorySchema.index({ doctorId: 1 });
MedicalHistorySchema.index({ date: -1 });
MedicalHistorySchema.index({ syncStatus: 1 });
MedicalHistorySchema.index({ isOffline: 1 });
MedicalHistorySchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
MedicalHistorySchema.index({ diagnosis: 'text', patientName: 'text', description: 'text' });

// Índice compuesto para búsquedas eficientes
MedicalHistorySchema.index({ 
  patientId: 1, 
  date: -1 
});

MedicalHistorySchema.index({ 
  doctorId: 1, 
  date: -1 
});

// Virtual para obtener la edad en años
MedicalHistorySchema.virtual('ageInYears').get(function() {
  return this.age;
});

// Virtual para obtener el estado de sincronización en español
MedicalHistorySchema.virtual('syncStatusText').get(function() {
  const statusMap = {
    pending: 'Pendiente',
    synced: 'Sincronizado',
    error: 'Error'
  };
  return statusMap[this.syncStatus] || 'Desconocido';
});

// Método para convertir a JSON
MedicalHistorySchema.methods.toJSON = function() {
  const historyObject = this.toObject();
  delete historyObject.__v;
  return historyObject;
};

// Método estático para buscar por paciente
MedicalHistorySchema.statics.findByPatient = function(patientId: string) {
  return this.find({ patientId }).sort({ date: -1 });
};

// Método estático para buscar por doctor
MedicalHistorySchema.statics.findByDoctor = function(doctorId: string) {
  return this.find({ doctorId }).sort({ date: -1 });
};

// Método estático para buscar por rango de fechas
MedicalHistorySchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Método estático para buscar por ubicación
MedicalHistorySchema.statics.findByLocation = function(latitude: number, longitude: number, radius: number = 10) {
  return this.find({
    'location.latitude': {
      $gte: latitude - (radius / 111), // Aproximación: 1 grado ≈ 111 km
      $lte: latitude + (radius / 111)
    },
    'location.longitude': {
      $gte: longitude - (radius / 111),
      $lte: longitude + (radius / 111)
    }
  });
};

// Método estático para obtener estadísticas
MedicalHistorySchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pendingSync: {
          $sum: { $cond: [{ $eq: ['$syncStatus', 'pending'] }, 1, 0] }
        },
        synced: {
          $sum: { $cond: [{ $eq: ['$syncStatus', 'synced'] }, 1, 0] }
        },
        errors: {
          $sum: { $cond: [{ $eq: ['$syncStatus', 'error'] }, 1, 0] }
        },
        offline: {
          $sum: { $cond: [{ $eq: ['$isOffline', true] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    pendingSync: 0,
    synced: 0,
    errors: 0,
    offline: 0
  };
};

// Método estático para obtener diagnósticos más comunes
MedicalHistorySchema.statics.getTopDiagnoses = async function(limit: number = 10) {
  const diagnoses = await this.aggregate([
    {
      $group: {
        _id: '$diagnosis',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return diagnoses;
};

// Método estático para obtener estadísticas por edad
MedicalHistorySchema.statics.getAgeStats = async function() {
  const ageStats = await this.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: '0-17' },
              { case: { $lt: ['$age', 30] }, then: '18-29' },
              { case: { $lt: ['$age', 45] }, then: '30-44' },
              { case: { $lt: ['$age', 60] }, then: '45-59' },
              { case: { $lt: ['$age', 75] }, then: '60-74' }
            ],
            default: '75+'
          }
        },
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return ageStats;
};

export default mongoose.model<MedicalHistoryDocument>('MedicalHistory', MedicalHistorySchema);
