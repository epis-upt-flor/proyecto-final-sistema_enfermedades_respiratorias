#!/bin/bash

# RespiCare Database Initialization Script
# This script initializes the database with required collections and indexes

set -e

echo "========================================="
echo "Initializing RespiCare Database"
echo "========================================="

# Wait for MongoDB to be ready
until mongosh --host mongodb --username "$MONGO_USERNAME" --password "$MONGO_PASSWORD" --authenticationDatabase admin --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB to be ready..."
    sleep 2
done

echo "MongoDB is ready. Creating database and collections..."

# Create database and collections
mongosh --host mongodb --username "$MONGO_USERNAME" --password "$MONGO_PASSWORD" --authenticationDatabase admin <<EOF

use ${MONGO_DB};

// Create collections if they don't exist
db.createCollection("users");
db.createCollection("patients");
db.createCollection("medicalHistories");
db.createCollection("aiAnalyses");
db.createCollection("appointments");
db.createCollection("notifications");
db.createCollection("auditLogs");

// Create indexes for users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "dni": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });

// Create indexes for patients
db.patients.createIndex({ "dni": 1 }, { unique: true });
db.patients.createIndex({ "userId": 1 });
db.patients.createIndex({ "createdAt": -1 });

// Create indexes for medical histories
db.medicalHistories.createIndex({ "patientId": 1 });
db.medicalHistories.createIndex({ "doctorId": 1 });
db.medicalHistories.createIndex({ "date": -1 });
db.medicalHistories.createIndex({ "diagnosis": 1 });
db.medicalHistories.createIndex({ "createdAt": -1 });

// Create indexes for AI analyses
db.aiAnalyses.createIndex({ "patientId": 1 });
db.aiAnalyses.createIndex({ "medicalHistoryId": 1 });
db.aiAnalyses.createIndex({ "status": 1 });
db.aiAnalyses.createIndex({ "createdAt": -1 });
db.aiAnalyses.createIndex({ "confidence": -1 });

// Create indexes for appointments
db.appointments.createIndex({ "patientId": 1 });
db.appointments.createIndex({ "doctorId": 1 });
db.appointments.createIndex({ "date": 1 });
db.appointments.createIndex({ "status": 1 });
db.appointments.createIndex({ "createdAt": -1 });

// Create indexes for notifications
db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// Create indexes for audit logs
db.auditLogs.createIndex({ "userId": 1 });
db.auditLogs.createIndex({ "action": 1 });
db.auditLogs.createIndex({ "timestamp": -1 });
db.auditLogs.createIndex({ "resource": 1 });

print("Database initialization completed successfully!");

EOF

echo "========================================="
echo "Database Initialization Complete"
echo "========================================="

