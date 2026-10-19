import { TestBed } from '@angular/core/testing';
import { HistoryService } from './history.service';
import { PurchaseSession } from './model/price-history';

describe('HistoryService', () => {
  let service: HistoryService;

  beforeEach(() => {
    localStorage.removeItem('PurchaseHistory');
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryService);
  });

  afterEach(() => localStorage.removeItem('PurchaseHistory'));

  it('getMonthlyTotals soma as compras de cada mês, do mais antigo ao atual', () => {
    const now = new Date();
    const inMonth = (offset: number, day: number) =>
      new Date(now.getFullYear(), now.getMonth() - offset, day, 12).toISOString();
    const sessions: PurchaseSession[] = [
      { date: inMonth(0, 1), total: 100, items: [] },
      { date: inMonth(0, 2), total: 50, items: [] },
      { date: inMonth(2, 15), total: 30, items: [] },
      { date: inMonth(6, 10), total: 999, items: [] }, // fora da janela de 6 meses
    ];
    service.loadFromRemote(sessions);

    const totals = service.getMonthlyTotals(6);

    expect(totals.length).toBe(6);
    expect(totals.map(t => t.total)).toEqual([0, 0, 0, 30, 0, 150]);
  });
});
