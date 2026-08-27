export interface AdminAuditLogResponse {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
  adminEmail?: string;
  description?: string;
  userAgent?: string;
}
