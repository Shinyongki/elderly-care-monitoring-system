import { z } from "zod";

// Official Survey Schema (공무원 설문)
export const officialSurveySchema = z.object({
  id: z.string(),
  department: z.string().min(1, "소속을 입력해주세요"),
  position: z.string().min(1, "직위를 선택해주세요"),
  experience: z.string().min(1, "경력을 선택해주세요"),
  necessity: z.number().min(1).max(5),
  sufficiency: z.number().min(1).max(5),
  neededServices: z.array(z.string()).max(2),
  effect: z.string().min(1, "가장 큰 효과를 입력해주세요"),
  problem: z.string().min(1, "가장 큰 문제점을 입력해주세요"),
  priority: z.string().min(1, "개선 우선순위를 입력해주세요"),
  knowledge: z.string().min(1, "인지도를 선택해주세요"),
  description: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const insertOfficialSurveySchema = officialSurveySchema.omit({ 
  id: true, 
  createdAt: true 
});

export type OfficialSurvey = z.infer<typeof officialSurveySchema>;
export type InsertOfficialSurvey = z.infer<typeof insertOfficialSurveySchema>;

// Elderly Survey Schema (어르신 설문)
export const elderlySurveySchema = z.object({
  id: z.string(),
  // Basic Info
  name: z.string().min(1, "이름을 입력해주세요"),
  gender: z.enum(["male", "female"]),
  age: z.number().min(65, "65세 이상이어야 합니다").max(120),
  residence: z.string().min(1, "거주지역을 선택해주세요"),
  serviceMonths: z.string().min(1, "서비스 이용기간을 선택해주세요"),
  careType: z.enum(["general", "intensive", "specialized"]),

  // Service Usage (5 services)
  serviceUsage: z.object({
    safety: z.object({
      usage: z.number().min(0),
      satisfaction: z.number().min(1).max(5),
    }),
    social: z.object({
      usage: z.number().min(0),
      satisfaction: z.number().min(1).max(5),
    }),
    education: z.object({
      usage: z.number().min(0),
      satisfaction: z.number().min(1).max(5),
    }),
    daily: z.object({
      usage: z.number().min(0),
      satisfaction: z.number().min(1).max(5),
    }),
    linkage: z.object({
      usage: z.number().min(0),
      satisfaction: z.number().min(1).max(5),
    }),
  }),

  // Detail Services
  detailServices: z.object({
    conversation: z.object({
      used: z.boolean(),
      satisfaction: z.number().min(1).max(4).optional(),
    }),
    housework: z.object({
      used: z.boolean(),
      satisfaction: z.number().min(1).max(4).optional(),
    }),
    meal: z.object({
      used: z.boolean(),
      satisfaction: z.number().min(1).max(4).optional(),
    }),
    outing: z.object({
      used: z.boolean(),
      satisfaction: z.number().min(1).max(4).optional(),
    }),
    counseling: z.object({
      used: z.boolean(),
      satisfaction: z.number().min(1).max(4).optional(),
    }),
    complaintService: z.string().optional(),
    complaintReason: z.string().optional(),
  }),

  // Overall Evaluation
  overallEvaluation: z.object({
    desiredService: z.number().min(1).max(5),
    sufficientService: z.number().min(1).max(5),
    lifeHelp: z.number().min(1).max(5),
    accessibility: z.number().min(1).max(5),
    overallSatisfaction: z.number().min(1).max(5),
  }),

  // Life Changes
  lifeChanges: z.object({
    loneliness: z.number().min(1).max(5),
    safety: z.number().min(1).max(5),
    learning: z.number().min(1).max(5),
    economic: z.number().min(1).max(5),
    social: z.number().min(1).max(5),
    health: z.number().min(1).max(5),
    convenience: z.number().min(1).max(5),
    lifeSatisfaction: z.number().min(1).max(5),
  }),

  // Additional Opinions
  additionalOpinions: z.object({
    mostSatisfiedService: z.union([z.string(), z.array(z.string())]).optional(),
    improvements: z.array(z.string()).max(4),
    improvementsOther: z.string().optional(),
    additionalServices: z.array(z.string()).max(4),
    additionalServicesOther: z.string().optional(),
  }),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  organization: z.string().min(1, "방문기관을 선택해주세요"),
});

export const insertElderlySurveySchema = elderlySurveySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type ElderlySurvey = z.infer<typeof elderlySurveySchema>;
export type InsertElderlySurvey = z.infer<typeof insertElderlySurveySchema>;

// Inventory Distribution Schema (물품반출)
export const inventoryDistributionSchema = z.object({
  id: z.string(),
  date: z.date(),
  organization: z.string().min(1, "방문기관명을 입력해주세요"),
  contact: z.string().min(1, "담당자를 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  elderly: z.number().min(0, "참여 어르신 수를 입력해주세요"),
  staff: z.number().min(0, "참여 종사자 수를 입력해주세요"),
  distributed: z.number().min(1, "반출 수량을 입력해주세요"),
  signature: z.string().min(1, "수령확인자를 입력해주세요"),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const insertInventoryDistributionSchema = inventoryDistributionSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type InventoryDistribution = z.infer<typeof inventoryDistributionSchema>;
export type InsertInventoryDistribution = z.infer<typeof insertInventoryDistributionSchema>;

// Inventory Summary Schema
export const inventorySummarySchema = z.object({
  totalStock: z.number().min(0),
  totalDistributed: z.number().min(0),
  remaining: z.number().min(0),
  distributionRate: z.number().min(0).max(100),
  lastUpdated: z.date().default(() => new Date()),
});

export type InventorySummary = z.infer<typeof inventorySummarySchema>;

// Organization Schema (방문기관)
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "기관명을 입력해주세요"),
  region: z.string().min(1, "지역을 선택해주세요"),
  type: z.enum(["welfare_center", "senior_center", "service_provider", "other"]),
  contact: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const insertOrganizationSchema = organizationSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Organization = z.infer<typeof organizationSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

// Document Management Schema
export const documentCategories = [
  '01_계획안',
  '02_공문발송', 
  '03_설문조사',
  '04_물품관리(업체)',
  '05_수행기관배포',
  '06_신청기관',
  '07_결과보고'
] as const;

export type DocumentCategory = typeof documentCategories[number];

export const documentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "파일명을 입력해주세요"),
  category: z.enum(documentCategories),
  fileType: z.string().min(1),
  fileSize: z.number().min(0),
  uploadDate: z.string(),
  uploader: z.string().min(1, "업로더를 입력해주세요"),
  description: z.string().optional(),
  fileData: z.string(), // Base64 encoded file data
  createdAt: z.date().default(() => new Date()),
});

export const insertDocumentSchema = documentSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;