# 🗺️ ROADMAP - MercApp

Este documento detalha as visões futuras e melhorias planejadas para o MercApp. As ideias estão divididas por categorias de impacto e complexidade, visando tornar o aplicativo uma ferramenta essencial, rápida e colaborativa para idas ao mercado.

---

## 📱 1. PWA e Suporte Offline-first (Prioridade Alta)

A conectividade dentro de supermercados muitas vezes é instável ou inexistente. Garantir que o aplicativo funcione sem internet é crucial.

- [ ] **Instalação Local:** Transformar o app em um PWA instalável via navegador (Adicionar à Tela Inicial).
- [ ] **Cache Dinâmico:** Implementar Service Workers (`@angular/pwa`) para cache da interface e assets essenciais.
- [ ] **Sincronização Offline:** Permitir adicionar itens e fechar compras offline, sincronizando com o backend quando a conexão retornar.

> [!IMPORTANT]
> A experiência de uso sem internet deve ser fluida e sem erros aparentes para o usuário.

---

## 📊 2. Histórico e Análise de Gastos (Prioridade Média)

Ajudar o usuário a entender a inflação dos seus produtos e o seu padrão de gastos.

- [ ] **Histórico de Preços:** Registrar o histórico do preço de cada item a cada compra concluída.
- [ ] **Indicadores Visuais:** Mostrar uma pequena seta (verde ⬇️ ou vermelha ⬆️) indicando se o produto está mais caro ou barato em relação à última compra.
- [ ] **Gráficos de Gastos:** Exibir gráficos mensais/semanais de despesas no supermercado (similar ao `money-coelho-app`).

---

## ☁️ 3. Sincronização em Tempo Real e Listas Compartilhadas (Prioridade Alta)

As compras da casa geralmente envolvem mais de uma pessoa.

- [ ] **Autenticação:** Login simples via Google (Firebase/Supabase).
- [ ] **Compartilhamento de Listas:** Enviar um convite para outros usuários acessarem e editarem a mesma lista.
- [ ] **Atualização em Tempo Real (WebSockets):** Se o usuário A no mercado marca um item como comprado, o usuário B em casa vê a atualização imediatamente e pode adicionar itens de última hora.

---

## 📷 4. Leitor de Código de Barras (Prioridade Média)

Acelerar a adição e identificação de produtos.

- [ ] **Escanear Códigos:** Integração com a câmera (via API do HTML5) para ler códigos EAN/UPC.
- [ ] **Auto-preenchimento:** Se o código já for conhecido pelo app (comprado anteriormente), preencher o nome e a foto automaticamente.

> [!TIP]
> O uso de bibliotecas como `html5-qrcode` pode facilitar a integração do leitor sem depender de componentes muito pesados.

---

## 🛒 5. Categorização e Roteirização no Mercado (Prioridade Baixa)

Evitar que o usuário ande em zigue-zague pelo supermercado.

- [ ] **Tags/Categorias:** Associar produtos a categorias (ex: "Laticínios", "Higiene", "Açougue").
- [ ] **Ordenação Inteligente:** Ordenar a lista automaticamente agrupando itens pelas categorias, simulando a ordem dos corredores.
- [ ] **Sugestões por IA/Banco:** Usar um banco de dados simples para inferir a categoria do produto ao digitá-lo.

---

## 🎨 6. Customização Visual e Dark Mode (Prioridade Baixa)

Modernizar ainda mais a interface.

- [ ] **Modo Escuro (Dark Mode):** Suporte total a temas escuros, economizando bateria do dispositivo e melhorando o conforto visual (utilizando CSS Variables).
- [ ] **Temas Alternativos:** Permitir que o usuário escolha a cor de sotaque (accent color) do app, indo além do laranja padrão (#E06010).

---

> [!NOTE]
> Este documento é vivo. Novas ideias, prioridades e mudanças técnicas serão registradas aqui conforme o projeto evolui.
