# Sync Manager Web

Sistema de Gestão para Estúdio de Sobrancelhas desenvolvido com Next.js 14+.

## Stack Tecnológica

### Frontend Core

- Next.js 14+ (App Router, Server Components, Server Actions)
- TypeScript 5+ (Strict Mode)
- Tailwind CSS (JIT mode, Dark mode)
- Shadcn/ui (Componentes base)

### State Management & Forms

- Zustand: Estado global
- React Query (TanStack Query): Cache e data fetching
- React Hook Form: Gerenciamento de formulários
- Zod: Validação de schemas

### Backend/Database

- Supabase (Auth, Database, Storage, Edge Functions)

### Testing

- Jest: Unit tests
- Testing Library: Component tests
- Cypress: E2E tests
- MSW: API mocking
- Vitest: Unit tests rápidos

### Qualidade de Código

- ESLint: Linting customizado
- Prettier: Formatação de código
- Husky: Git hooks
- Commitlint: Padronização de commits

## Começando

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linting
- `npm run test`: Executa os testes
- `npm run test:e2e`: Executa os testes E2E
- `npm run test:watch`: Executa os testes em modo watch

## Estrutura de Pastas

```
├── .github/
│   └── workflows/            # CI/CD workflows
├── __tests__/               # Testes globais
│   ├── e2e/                 # Testes E2E Cypress
│   └── integration/         # Testes de integração
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Rotas autenticadas
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── ui/             # Componentes base (shadcn)
│   │   ├── forms/          # Componentes de formulário
│   │   ├── layout/         # Componentes de layout
│   │   └── shared/         # Componentes compartilhados
│   ├── config/             # Configurações
│   │   ├── site/           # Configurações do site
│   │   └── dashboard/      # Configurações do dashboard
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Bibliotecas e utils
│   │   ├── supabase/       # Cliente Supabase
│   │   ├── validations/    # Schemas Zod
│   │   └── utils/          # Funções utilitárias
│   ├── store/              # Zustand stores
│   ├── styles/             # Estilos globais
│   └── types/              # Tipos TypeScript
```

## Melhorias Recentes

### Prevenção de Duplicação de Clientes

O sistema foi aprimorado para detectar e prevenir automaticamente a criação de clientes duplicados:

- Implementação de uma função central `checkIfCustomerExists` no `CustomerStore` que verifica se um cliente já existe baseado no número de telefone
- Normalização de números de telefone para garantir que diferentes formatos sejam reconhecidos como o mesmo número
- Integração da verificação de duplicidade em todas as entradas do sistema:
  - Formulário de agendamento para clientes finais
  - Formulário de criação de atendimento no dashboard
  - Importação de clientes em massa

Benefícios:

- Redução de registros duplicados na base de dados
- Melhor experiência do usuário ao identificar automaticamente clientes retornando
- Histórico de atendimentos consolidado para cada cliente
- Maior confiabilidade no sistema de fidelidade

### Melhorias na UI de Seleção Múltipla

O componente `MultiSelect` foi otimizado para:

- Melhor performance com o uso de `React.useMemo` e `React.useCallback`
- Prevenção de re-renderizações desnecessárias
- Interface mais intuitiva para seleção de múltiplos itens
- Melhor filtro de pesquisa para grandes conjuntos de dados

## Convenções de Código

- Commits seguem o padrão Conventional Commits
- Código formatado com Prettier
- Linting com ESLint
- TypeScript em Strict Mode
- Testes para novas features

## Contribuindo

1. Crie uma branch: `git checkout -b feature/nome-da-feature`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
3. Push para a branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

## Sistema de Dados Mockados

Este projeto utiliza dados mockados para desenvolvimento que são **automaticamente excluídos da build de produção**.

### Como funciona

- Arquivos `.env.development` e `.env.production` controlam o uso de mocks
- Importação dinâmica e verificação de ambiente garantem exclusão do código em produção
- Script `check-mocks` verifica se a build está livre de referências aos dados mockados

### Comandos úteis

```bash
# Construir para produção (sem mocks)
npm run build

# Verificar se não há referências a mocks na build
npm run check-mocks
```

Para mais detalhes, consulte o [MOCK_DATA_README.md](./MOCK_DATA_README.md).
