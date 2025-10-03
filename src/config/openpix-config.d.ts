export interface PaymentData {
  value: number;
  correlationID?: string;
  comment?: string;
  expiresIn?: number;
  payer?: {
    name?: string;
    cpf?: string;
    email?: string;
    phone?: string;
  };
  additionalInfo?: Array<{ name: string; value: string }>;
}

export interface ChargeStatus {
  id: string;
  status: string;
  value: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export declare const createCharge: (paymentData: PaymentData) => Promise<ChargeStatus>;
export declare const getChargeStatus: (chargeId: string) => Promise<ChargeStatus>;

export declare const OPENPIX_API_KEY: string;
export declare const OPENPIX_APP_ID: string;
export declare const OPENPIX_CLIENT_ID: string;
export declare const OPENPIX_CORP_ID: string;
export declare const OPENPIX_WEBHOOK_TOKEN: string;
export declare const API_BASE_URL: string;
export declare const WEBHOOK_URL: string;
export interface PaymentConfigs {
  currency: string;
  minValue: number;
  maxValue: number;
  allowInstallments?: boolean;
  [key: string]: unknown;
}
export declare const PAYMENT_CONFIGS: PaymentConfigs;
