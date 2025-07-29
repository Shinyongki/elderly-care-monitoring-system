import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { 
  OfficialSurvey, 
  ElderlySurvey, 
  InventoryDistribution, 
  InventorySummary,
  Organization,
  Document
} from '@shared/schema';

interface MonitoringDB extends DBSchema {
  officialSurveys: {
    key: string;
    value: OfficialSurvey;
    indexes: { 'by-department': string; 'by-date': Date };
  };
  elderlySurveys: {
    key: string;
    value: ElderlySurvey;
    indexes: { 'by-organization': string; 'by-date': Date; 'by-region': string };
  };
  inventoryDistributions: {
    key: string;
    value: InventoryDistribution;
    indexes: { 'by-organization': string; 'by-date': Date };
  };
  inventorySummary: {
    key: string;
    value: InventorySummary;
  };
  organizations: {
    key: string;
    value: Organization;
    indexes: { 'by-region': string; 'by-type': string };
  };
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-category': string; 'by-date': string; 'by-uploader': string };
  };
}

class StorageManager {
  private db: IDBPDatabase<MonitoringDB> | null = null;

  async resetDatabase(): Promise<void> {
    // Create backup before reset
    try {
      const backupData = await this.exportData();
      // Save backup to localStorage
      localStorage.setItem('monitoring-backup-before-reset', JSON.stringify({
        data: backupData,
        timestamp: new Date().toISOString()
      }));
      console.log('데이터베이스 리셋 전 백업이 localStorage에 저장되었습니다.');
    } catch (error) {
      console.warn('백업 생성 중 오류 발생:', error);
    }

    // Close existing connection
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    // Delete existing database
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase('monitoring-system');
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => reject(deleteReq.error);
    });
  }

  async restoreFromResetBackup(): Promise<boolean> {
    try {
      const backupStr = localStorage.getItem('monitoring-backup-before-reset');
      if (backupStr) {
        const backup = JSON.parse(backupStr);
        await this.importData(backup.data);
        console.log('리셋 전 백업에서 데이터를 복원했습니다.');
        return true;
      }
    } catch (error) {
      console.error('백업 복원 실패:', error);
    }
    return false;
  }

  async init(): Promise<void> {
    try {
      this.db = await openDB<MonitoringDB>('monitoring-system', 4, {
        upgrade(db, oldVersion) {
          // Clear all existing stores and recreate them to avoid conflicts
          const storeNames = ['officialSurveys', 'elderlySurveys', 'inventoryDistributions', 'inventorySummary', 'organizations', 'documents'];

          // Delete existing stores
          for (const storeName of storeNames) {
            if (db.objectStoreNames.contains(storeName)) {
              db.deleteObjectStore(storeName);
            }
          }

          // Create all stores fresh
          const officialSurveyStore = db.createObjectStore('officialSurveys', {
            keyPath: 'id',
          });
          officialSurveyStore.createIndex('by-department', 'department');
          officialSurveyStore.createIndex('by-date', 'createdAt');

          const elderlySurveyStore = db.createObjectStore('elderlySurveys', {
            keyPath: 'id',
          });
          elderlySurveyStore.createIndex('by-organization', 'organization');
          elderlySurveyStore.createIndex('by-date', 'createdAt');
          elderlySurveyStore.createIndex('by-region', 'residence');

          const inventoryStore = db.createObjectStore('inventoryDistributions', {
            keyPath: 'id',
          });
          inventoryStore.createIndex('by-organization', 'organization');
          inventoryStore.createIndex('by-date', 'date');

          db.createObjectStore('inventorySummary', {
            keyPath: 'id',
          });

          const organizationStore = db.createObjectStore('organizations', {
            keyPath: 'id',
          });
          organizationStore.createIndex('by-region', 'region');
          organizationStore.createIndex('by-type', 'type');

          const documentsStore = db.createObjectStore('documents', {
            keyPath: 'id',
          });
          documentsStore.createIndex('by-category', 'category');
          documentsStore.createIndex('by-date', 'uploadDate');
          documentsStore.createIndex('by-uploader', 'uploader');
        },
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Try to reset database on error
      try {
        await this.resetDatabase();
        // Retry initialization after reset
        this.db = await openDB<MonitoringDB>('monitoring-system', 4, {
          upgrade(db, oldVersion) {
            const officialSurveyStore = db.createObjectStore('officialSurveys', {
              keyPath: 'id',
            });
            officialSurveyStore.createIndex('by-department', 'department');
            officialSurveyStore.createIndex('by-date', 'createdAt');

            const elderlySurveyStore = db.createObjectStore('elderlySurveys', {
              keyPath: 'id',
            });
            elderlySurveyStore.createIndex('by-organization', 'organization');
            elderlySurveyStore.createIndex('by-date', 'createdAt');
            elderlySurveyStore.createIndex('by-region', 'residence');

            const inventoryStore = db.createObjectStore('inventoryDistributions', {
              keyPath: 'id',
            });
            inventoryStore.createIndex('by-organization', 'organization');
            inventoryStore.createIndex('by-date', 'date');

            db.createObjectStore('inventorySummary', {
              keyPath: 'id',
            });

            const organizationStore = db.createObjectStore('organizations', {
              keyPath: 'id',
            });
            organizationStore.createIndex('by-region', 'region');
            organizationStore.createIndex('by-type', 'type');

            const documentsStore = db.createObjectStore('documents', {
              keyPath: 'id',
            });
            documentsStore.createIndex('by-category', 'category');
            documentsStore.createIndex('by-date', 'uploadDate');
            documentsStore.createIndex('by-uploader', 'uploader');
          },
        });
      } catch (resetError) {
        console.error('Failed to reset and reinitialize database:', resetError);
        throw resetError;
      }
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<MonitoringDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Official Surveys
  async saveOfficialSurvey(survey: OfficialSurvey): Promise<void> {
    const db = await this.ensureDB();
    await db.put('officialSurveys', survey);
  }

  async saveOfficialSurveys(surveys: OfficialSurvey[]): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction('officialSurveys', 'readwrite');
    await Promise.all([
      ...surveys.map(survey => tx.store.put(survey)),
      tx.done,
    ]);
  }

  async getOfficialSurveys(): Promise<OfficialSurvey[]> {
    const db = await this.ensureDB();
    return await db.getAll('officialSurveys');
  }

  async getOfficialSurveysByDepartment(department: string): Promise<OfficialSurvey[]> {
    const db = await this.ensureDB();
    return await db.getAllFromIndex('officialSurveys', 'by-department', department);
  }

    async deleteOfficialSurvey(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('officialSurveys', id);
  }

  // Elderly Surveys
  async saveElderlySurvey(survey: ElderlySurvey): Promise<void> {
    const db = await this.ensureDB();
    await db.put('elderlySurveys', survey);
  }

  async getElderlySurveys(): Promise<ElderlySurvey[]> {
    const db = await this.ensureDB();
    return await db.getAll('elderlySurveys');
  }

  async getElderlySurveysByOrganization(organization: string): Promise<ElderlySurvey[]> {
    const db = await this.ensureDB();
    return await db.getAllFromIndex('elderlySurveys', 'by-organization', organization);
  }

  async deleteElderlySurvey(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('elderlySurveys', id);
  }

  // Inventory
  async saveInventoryDistribution(distribution: InventoryDistribution): Promise<void> {
    const db = await this.ensureDB();
    await db.put('inventoryDistributions', distribution);
  }

  async getInventoryDistributions(): Promise<InventoryDistribution[]> {
    const db = await this.ensureDB();
    return await db.getAll('inventoryDistributions');
  }

  async deleteInventoryDistribution(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('inventoryDistributions', id);
  }

  async saveInventorySummary(summary: InventorySummary): Promise<void> {
    const db = await this.ensureDB();
    await db.put('inventorySummary', { ...summary, id: 'current' });
  }

  async getInventorySummary(): Promise<InventorySummary | null> {
    const db = await this.ensureDB();
    const result = await db.get('inventorySummary', 'current');
    return result || null;
  }

  // Organizations
  async saveOrganization(organization: Organization): Promise<void> {
    const db = await this.ensureDB();
    await db.put('organizations', organization);
  }

  async getOrganizations(): Promise<Organization[]> {
    const db = await this.ensureDB();
    return await db.getAll('organizations');
  }

  // Backup and restore
  async exportData(): Promise<{
    officialSurveys: OfficialSurvey[];
    elderlySurveys: ElderlySurvey[];
    inventoryDistributions: InventoryDistribution[];
    inventorySummary: InventorySummary | null;
    organizations: Organization[];
    documents: Document[];
    exportDate: string;
  }> {
    const [
      officialSurveys,
      elderlySurveys,
      inventoryDistributions,
      inventorySummary,
      organizations,
      documents,
    ] = await Promise.all([
      this.getOfficialSurveys(),
      this.getElderlySurveys(),
      this.getInventoryDistributions(),
      this.getInventorySummary(),
      this.getOrganizations(),
      this.getDocuments(),
    ]);

    return {
      officialSurveys,
      elderlySurveys,
      inventoryDistributions,
      inventorySummary,
      organizations,
      documents,
      exportDate: new Date().toISOString(),
    };
  }

  async importData(data: {
    officialSurveys?: OfficialSurvey[];
    elderlySurveys?: ElderlySurvey[];
    inventoryDistributions?: InventoryDistribution[];
    inventorySummary?: InventorySummary;
    organizations?: Organization[];
    documents?: Document[];
  }): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(
      ['officialSurveys', 'elderlySurveys', 'inventoryDistributions', 'inventorySummary', 'organizations', 'documents'],
      'readwrite'
    );

    const promises: Promise<any>[] = [];

    if (data.officialSurveys) {
      promises.push(...data.officialSurveys.map(item => tx.objectStore('officialSurveys').put(item)));
    }

    if (data.elderlySurveys) {
      promises.push(...data.elderlySurveys.map(item => tx.objectStore('elderlySurveys').put(item)));
    }

    if (data.inventoryDistributions) {
      promises.push(...data.inventoryDistributions.map(item => tx.objectStore('inventoryDistributions').put(item)));
    }

    if (data.inventorySummary) {
      promises.push(tx.objectStore('inventorySummary').put({ ...data.inventorySummary, id: 'current' }));
    }

    if (data.organizations) {
      promises.push(...data.organizations.map(item => tx.objectStore('organizations').put(item)));
    }

    if (data.documents) {
      promises.push(...data.documents.map(item => tx.objectStore('documents').put(item)));
    }

    promises.push(tx.done);
    await Promise.all(promises);
  }

  // Documents
  async saveDocument(document: Document): Promise<void> {
    const db = await this.ensureDB();
    await db.put('documents', document);
  }

  async getDocuments(): Promise<Document[]> {
    const db = await this.ensureDB();
    return await db.getAll('documents');
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    const db = await this.ensureDB();
    return await db.getAllFromIndex('documents', 'by-category', category);
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('documents', id);
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(
      ['officialSurveys', 'elderlySurveys', 'inventoryDistributions', 'inventorySummary', 'organizations', 'documents'],
      'readwrite'
    );

    await Promise.all([
      tx.objectStore('officialSurveys').clear(),
      tx.objectStore('elderlySurveys').clear(),
      tx.objectStore('inventoryDistributions').clear(),
      tx.objectStore('inventorySummary').clear(),
      tx.objectStore('organizations').clear(),
      tx.objectStore('documents').clear(),
      tx.done,
    ]);
  }
}

export const storage = new StorageManager();