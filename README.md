<div align="center">

# 🛒 MercApp

**Lista de compras inteligente com cálculo de valores em tempo real**

[![Live Demo](https://img.shields.io/badge/▶%20Demo%20ao%20vivo-E06010?style=for-the-badge&logoColor=white)](https://zclt.github.io/MercApp/)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Material](https://img.shields.io/badge/Angular%20Material-20-757575?style=for-the-badge&logo=material-design&logoColor=white)](https://material.angular.io)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-222222?style=for-the-badge&logo=github&logoColor=white)](https://zclt.github.io/MercApp/)

</div>

---

## O que é o MercApp?

O MercApp é um aplicativo web mobile-first para facilitar suas compras no mercado. Você monta a lista antes de sair de casa, e na hora das compras vai adicionando os preços pelo teclado numérico — o app calcula o total automaticamente enquanto você compra.

---

## Funcionalidades

| | Recurso | Descrição |
|---|---|---|
| 📋 | **Lista de compras** | Crie sua lista antes de ir ao mercado |
| 🧮 | **Teclado numérico** | Digite preços com precisão de centavos |
| 🛒 | **Carrinho inteligente** | Soma automática com quantidade por item |
| ✅ | **Marcação de itens** | Toque no item da lista para preencher o preço automaticamente |
| ↩️ | **Desfazer** | Esvazie o carrinho com opção de desfazer a ação |
| 📱 | **Mobile-first** | Interface otimizada para uso na palma da mão |

---

## Como usar

```
1. Monte a lista  →  Toque em ☰ e adicione os itens que precisa comprar

2. No mercado     →  Toque em um item da lista para selecioná-lo

3. Digite o preço →  Use o teclado numérico (ex: 5, 9, 0 = R$ 5,90)

4. Adicionar      →  Toque em "Adicionar" — o item vai pro carrinho e
                     é marcado como comprado na lista

5. Total          →  Acompanhe o valor total em tempo real na barra superior
```

---

## Screenshots

> Acesse a demo ao vivo: **[zclt.github.io/MercApp](https://zclt.github.io/MercApp/)**

| Carrinho | Lista de compras |
|---|---|
| *Tela principal com teclado e total* | *Drawer lateral com lista* |

---

## Paleta de cores

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://via.placeholder.com/80x80/E06010/FFFFFF?text=+" width="80" height="80"/><br/>
      <strong>#E06010</strong><br/>
      <sub>Laranja — primário</sub>
    </td>
    <td align="center" width="120">
      <img src="https://via.placeholder.com/80x80/FFFFFF/E06010?text=+" width="80" height="80"/><br/>
      <strong>#FFFFFF</strong><br/>
      <sub>Branco — fundo</sub>
    </td>
    <td align="center" width="120">
      <img src="https://via.placeholder.com/80x80/212121/FFFFFF?text=+" width="80" height="80"/><br/>
      <strong>#212121</strong><br/>
      <sub>Escuro — texto</sub>
    </td>
    <td align="center" width="120">
      <img src="https://via.placeholder.com/80x80/757575/FFFFFF?text=+" width="80" height="80"/><br/>
      <strong>#757575</strong><br/>
      <sub>Cinza — secundário</sub>
    </td>
  </tr>
</table>

---

## Stack

- **[Angular 20](https://angular.dev)** — framework principal, standalone components, signals
- **[Angular Material 20](https://material.angular.io)** — componentes de UI (toolbar, drawer, keypad, badges)
- **TypeScript 5.8**
- **RxJS 7.8**

---

## Rodar localmente

```bash
# Clonar o repositório
git clone https://github.com/zclt/MercApp.git
cd MercApp

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
# Acesse http://localhost:4200
```

## Build para produção

```bash
# Build padrão
npm run build

# Build para GitHub Pages (base-href correto)
npm run github-docs
```

Os arquivos de produção são gerados na pasta `docs/`, que é servida pelo GitHub Pages.

---

<div align="center">
  Feito com ☕ e <strong style="color:#E06010">Angular</strong>
</div>
