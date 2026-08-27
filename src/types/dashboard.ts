export interface DashboardSummaryResponse {
  orders: {
    waitingQuote: number;
    quoteReady: number;
    waitingPayment: number;
    paymentReported: number;
    paymentConfirmed: number;
    preparing: number;
    ready: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  quotes: {
    pending: number;
    ready: number;
  };
  payments: {
    pendingVerification: number;
    confirmed: number;
    rejected: number;
  };
  today: {
    orders: number;
    confirmedPayments: number;
    sales: number;
  };
}
