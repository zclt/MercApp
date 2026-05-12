import { test, expect } from '@playwright/test';

test.describe('MercApp - Fluxo principal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('exibe carrinho vazio ao abrir o app', async ({ page }) => {
    await expect(page.getByText('Carrinho vazio')).toBeVisible();
    await expect(page.getByText('Digite um preço e toque em')).toBeVisible();
  });

  test('digita preço pelo teclado virtual e adiciona item ao carrinho', async ({ page }) => {
    // Digita 1 2 3 → 1.23
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();

    await expect(page.locator('.price-value')).toContainText('1.23');

    await page.locator('button.add-btn').click();

    await expect(page.locator('.item-count').first()).toContainText('1×');
  });

  test('adiciona múltiplos itens e verifica total na toolbar', async ({ page }) => {
    // Adiciona 2.00
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.locator('button.add-btn').click();

    // Adiciona 3.50
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.locator('button.add-btn').click();

    // Total deve ser 5.50
    await expect(page.locator('.toolbar-total')).toContainText('5.50');
  });

  test('botão C limpa o valor digitado', async ({ page }) => {
    await page.getByRole('button', { name: '9', exact: true }).click();
    await page.getByRole('button', { name: '9', exact: true }).click();
    // Botão C — seleciona pelo texto exato dentro do keypad
    await page.locator('.keypad button', { hasText: /^C$/ }).click();

    await expect(page.locator('.price-value')).toContainText('0.00');
  });

  test('botão backspace apaga último dígito', async ({ page }) => {
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('button', { name: 'Apagar último dígito' }).click();

    await expect(page.locator('.price-value')).toContainText('0.12');
  });

  test('abre e fecha o drawer da lista de compras', async ({ page }) => {
    await page.locator('#todo-list').click();

    const drawer = page.locator('mat-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Lista vazia')).toBeVisible();

    // Fecha clicando no backdrop do drawer
    await page.locator('.mat-drawer-backdrop').click();
    await expect(drawer).not.toBeVisible();
  });

  test('adiciona item à lista de compras via drawer', async ({ page }) => {
    await page.locator('#todo-list').click();

    const drawer = page.locator('mat-drawer');
    await drawer.getByRole('button', { name: 'Adicionar', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').fill('Arroz');
    await dialog.getByRole('button', { name: 'Ok', exact: true }).click();

    await expect(drawer.getByText('Arroz')).toBeVisible();
  });

  test('swipe para direita aumenta quantidade do item no carrinho', async ({ page }) => {
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.locator('button.add-btn').click();

    const itemCard = page.locator('mat-drawer-content .item-card').first();

    const box = await itemCard.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }

    await expect(page.locator('.item-count').first()).toContainText('2×');
  });

  test('esvaziar carrinho pelo menu', async ({ page }) => {
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    await page.locator('button.add-btn').click();

    await page.getByRole('button', { name: 'Ver carrinho' }).click();
    await page.getByRole('menuitem', { name: 'Esvaziar carrinho' }).click();

    await expect(page.getByText('Carrinho vazio')).toBeVisible();
    await expect(page.locator('.toolbar-total')).toContainText('0.00');
  });

});
