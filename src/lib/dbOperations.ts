import db from './db';
import { v4 as uuidv4 } from 'uuid';

import { hashPassword } from './auth';

// Common database operations for the application

// Profiles operations
export const profileOperations = {
  // Get a profile by user ID
  getById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
    const result = stmt.get(id);
    return result ? normalizeRow(result) : null;
  },

  // Create or update a profile
  upsert: async (profileData: any) => {
    const existing = profileOperations.getById(profileData.id);

    // Hash password if provided
    if (profileData.password) {
      profileData.password = await hashPassword(profileData.password);
    }

    if (existing) {
      // Update existing profile
      const updateFields = [];
      const params = [];

      for (const [key, value] of Object.entries(profileData)) {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (updateFields.length > 0) {
        params.push(profileData.id);
        const query = `UPDATE profiles SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const stmt = db.prepare(query);
        stmt.run(...params);
      }
    } else {
      // Insert new profile
      const insertFields = ['id'];
      const insertValues = [profileData.id || uuidv4()];
      const placeholders = ['?'];

      for (const [key, value] of Object.entries(profileData)) {
        if (key !== 'id') {
          insertFields.push(key);
          insertValues.push(value);
          placeholders.push('?');
        }
      }

      const query = `
        INSERT INTO profiles (${insertFields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders.join(', ')}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      const stmt = db.prepare(query);
      stmt.run(...insertValues);
    }

    return profileOperations.getById(profileData.id);
  },

  // Update a profile
  update: (id: string, updateData: any) => {
    // Build dynamic update query
    const updateFields = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updateFields.length === 0) {
      return profileOperations.getById(id);
    }

    params.push(id); // Add ID for WHERE clause

    const query = `UPDATE profiles SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return profileOperations.getById(id);
  },

  // Get all profiles with optional filtering
  getAll: (filters?: { role?: string; verification_status?: string; is_available?: boolean }) => {
    let query = 'SELECT * FROM profiles';
    const params: any[] = [];

    if (filters) {
      const conditions = [];

      if (filters.role) {
        conditions.push('role = ?');
        params.push(filters.role);
      }

      if (filters.verification_status) {
        conditions.push('verification_status = ?');
        params.push(filters.verification_status);
      }

      if (typeof filters.is_available !== 'undefined') {
        conditions.push('is_available = ?');
        params.push(filters.is_available ? 1 : 0);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const results = stmt.all(...params);

    return results.map(normalizeRow);
  }
};

// Appointments operations
export const appointmentOperations = {
  // Get appointments by user ID (either client or vet)
  getByUserId: (userId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM appointments 
      WHERE user_id = ? OR vet_id = ? 
      ORDER BY appointment_datetime DESC
    `);
    const results = stmt.all(userId, userId);
    return results.map(normalizeRow);
  },

  // Get appointment by ID
  getById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
    const result = stmt.get(id);
    return result ? normalizeRow(result) : null;
  },

  // Create a new appointment
  create: (appointmentData: any) => {
    const stmt = db.prepare(`
      INSERT INTO appointments (id, user_id, vet_id, appointment_datetime,
                               status, reason, images, diagnosis, prescription, vet_comments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const id = appointmentData.id || uuidv4();
    stmt.run(
      id,
      appointmentData.user_id,
      appointmentData.vet_id,
      appointmentData.appointment_datetime,
      appointmentData.status || 'pending',
      appointmentData.reason || null,
      appointmentData.images || null,
      appointmentData.diagnosis || null,
      appointmentData.prescription || null,
      appointmentData.vet_comments || null
    );

    return appointmentOperations.getById(id);
  },

  // Get all appointments with optional filtering
  getAll: (filters?: { status?: string; user_id?: string; vet_id?: string }) => {
    let query = 'SELECT * FROM appointments';
    const params: any[] = [];

    if (filters) {
      const conditions = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.user_id) {
        conditions.push('user_id = ?');
        params.push(filters.user_id);
      }

      if (filters.vet_id) {
        conditions.push('vet_id = ?');
        params.push(filters.vet_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    query += ' ORDER BY appointment_datetime DESC';

    const stmt = db.prepare(query);
    const results = stmt.all(...params);

    return results.map(normalizeRow);
  },

  // Update an appointment
  update: (id: string, updateData: any) => {
    // Build dynamic update query
    const updateFields = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updateFields.length === 0) {
      return appointmentOperations.getById(id);
    }

    params.push(id); // Add ID for WHERE clause

    const query = `UPDATE appointments SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return appointmentOperations.getById(id);
  }
};

// Notifications operations
export const notificationOperations = {
  // Get notifications by user ID
  getByUserId: (userId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    const results = stmt.all(userId);
    return results.map(normalizeRow);
  },

  // Get notification by ID
  getById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    const result = stmt.get(id);
    return result ? normalizeRow(result) : null;
  },

  // Create a new notification
  create: (notificationData: any) => {
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, 
                                type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const id = notificationData.id || uuidv4();
    stmt.run(
      id,
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type || 'info',
      notificationData.is_read ? 1 : 0
    );
    
    return notificationOperations.getById(id);
  },

  // Update a notification (e.g., mark as read)
  update: (id: string, updateData: any) => {
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'id' && key !== 'created_at') {
        if (key === 'is_read') {
          // Convert boolean to integer for SQLite
          updateFields.push(`${key} = ?`);
          params.push(value ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      }
    }
    
    if (updateFields.length === 0) {
      return notificationOperations.getById(id);
    }
    
    params.push(id); // Add ID for WHERE clause
    
    const query = `UPDATE notifications SET ${updateFields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);
    
    return notificationOperations.getById(id);
  }
};

// Helper function to normalize rows
function normalizeRow(row: any): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(row)) {
    // Convert SQLite integer booleans back to JavaScript booleans
    if (key.includes('_read') || key === 'is_read' || key === 'is_available') {
      normalized[key] = Boolean(value);
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

// Veterinarian schedule operations
export const vetScheduleOperations = {
  // Get schedule by vet ID
  getByVetId: (vetId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM veterinarian_schedules
      WHERE vet_id = ?
      ORDER BY day_of_week ASC
    `);
    const results = stmt.all(vetId);
    return results.map(normalizeRow);
  },

  // Create or update schedule for a vet
  upsertForVet: (vetId: string, scheduleData: any[]) => {
    // Begin transaction to ensure data consistency
    db.exec('BEGIN TRANSACTION');

    try {
      // Delete existing schedule for this vet
      const deleteStmt = db.prepare('DELETE FROM veterinarian_schedules WHERE vet_id = ?');
      deleteStmt.run(vetId);

      // Insert new schedule
      const insertStmt = db.prepare(`
        INSERT INTO veterinarian_schedules (id, vet_id, day_of_week, start_time, end_time, is_available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      for (const daySchedule of scheduleData) {
        insertStmt.run(
          uuidv4(),
          vetId,
          daySchedule.day_of_week,
          daySchedule.start_time,
          daySchedule.end_time,
          daySchedule.is_available ? 1 : 0
        );
      }

      // Commit the transaction
      db.exec('COMMIT');

      // Return the updated schedule
      return vetScheduleOperations.getByVetId(vetId);
    } catch (error) {
      // Rollback the transaction in case of error
      db.exec('ROLLBACK');
      throw error;
    }
  },

  // Get available times for a specific day for a vet
  getAvailableTimesForDay: (vetId: string, dayOfWeek: number) => {
    const stmt = db.prepare(`
      SELECT * FROM veterinarian_schedules
      WHERE vet_id = ? AND day_of_week = ? AND is_available = 1
    `);
    const result = stmt.get(vetId, dayOfWeek);
    return result ? normalizeRow(result) : null;
  }
};

// Separate function to get profiles with schedules
export function getProfilesWithSchedules(filters?: { role?: string; verification_status?: string }) {
  let query = `
    SELECT p.*,
           vs.day_of_week,
           vs.start_time,
           vs.end_time,
           vs.is_available as schedule_is_available
    FROM profiles p
    LEFT JOIN veterinarian_schedules vs ON p.id = vs.vet_id
  `;
  const params: any[] = [];

  if (filters) {
    const conditions = [];

    if (filters.role) {
      conditions.push('p.role = ?');
      params.push(filters.role);
    }

    if (filters.verification_status) {
      conditions.push('p.verification_status = ?');
      params.push(filters.verification_status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
  }

  query += ' ORDER BY p.created_at DESC, vs.day_of_week ASC';

  const stmt = db.prepare(query);
  const results: any[] = stmt.all(...params);

  // Group results by profile
  const groupedResults: any[] = [];
  const profileMap = new Map<string, any>();

  results.forEach((row: any) => {
    if (!profileMap.has(row.id)) {
      // Create a new profile object with an empty schedule array
      const profile = { ...row, schedule: [] };
      delete profile.day_of_week;
      delete profile.start_time;
      delete profile.end_time;
      delete profile.schedule_is_available;
      profileMap.set(row.id, profile);
      groupedResults.push(profile);
    }

    // Add schedule info if it exists
    if (row.day_of_week !== null) {
      const profile = profileMap.get(row.id);
      profile.schedule.push({
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        is_available: row.schedule_is_available
      });
    }
  });

  return groupedResults.map(normalizeRow);
}