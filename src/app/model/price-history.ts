export interface PurchaseSession {
  date: string;
  total: number;
  items: { nome: string; valor: number; count: number }[];
}
