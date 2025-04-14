# Sistema de Dados Mockados

## Visão Geral

Este projeto inclui um sistema de dados mockados para desenvolvimento e testes, que é **automaticamente desativado em produção**. Os dados mockados incluem:

- 23 clientes (Customers)
- 5 serviços (Services)
- 14 agendamentos (Appointments)
- 8 receitas (Receipts)
- 5 despesas (Expenses)

## Como Funciona

O sistema foi projetado com múltiplas camadas de proteção:

1. **Detectar o ambiente automaticamente**: Os dados mockados só são carregados quando `process.env.NODE_ENV === 'development'` ou quando explicitamente habilitados com `NEXT_PUBLIC_USE_MOCKS=true`.
2. **Utilizar importação dinâmica**: Importações dinâmicas (usando `import()`) garantem que o webpack não inclua o código na build de produção.
3. **Verificação dupla de segurança**: Mesmo se o código de mock for acidentalmente incluído, há verificações em runtime que impedem seu uso em produção.
4. **Arquivos de ambiente**: Existem configurações específicas em `.env.development` e `.env.production` para controlar o uso de mocks.
5. **Scripts de verificação**: Execute `npm run check-mocks` para verificar se sua build está livre de referências a dados mockados.

## Scripts Disponíveis

- `npm run build` - Constrói o projeto normalmente
- `npm run build:with-mocks` - Força a inclusão de mocks mesmo em produção (útil para testes)
- `npm run build:no-mocks` - Força a exclusão de mocks mesmo em desenvolvimento
- `npm run check-mocks` - Verifica se a build contém referências a dados mockados

## Como Utilizar

### ✅ Modo Correto (Seguro)

```typescript
// Em qualquer arquivo que precise de dados mockados:
import { loadMockData } from '@/lib/utils'

async function fetchDataWithMocks() {
  // Os dados mockados só serão carregados em desenvolvimento
  const customers = await loadMockData<Customer>('customers')

  // Lógica que usa dados reais em produção e mockados em desenvolvimento
  // ...
}
```

### ❌ Modo Incorreto (Inseguro)

```typescript
// NÃO faça isso:
import { mockCustomers } from '@/lib/mock-data' // Importação direta não é recomendada

// NÃO faça isso também:
async function insecureFunction() {
  const mockModule = await import('@/lib/mock-data')
  return mockModule.mockCustomers // Acesso direto aos dados, sem usar as funções getters
}
```

## Variáveis de Ambiente

O sistema usa as seguintes variáveis de ambiente para controlar o comportamento dos mocks:

- `NODE_ENV` - Definido como 'development' ou 'production'
- `NEXT_PUBLIC_USE_MOCKS` - Pode ser 'true' para forçar o uso de mocks ou 'false' para desabilitá-los

Os arquivos `.env.development` e `.env.production` contêm as configurações padrão para cada ambiente.

## Verificação da Build

Após construir para produção, você pode verificar se os dados mockados foram excluídos com:

```bash
# Verifica referências a mocks na build
npm run check-mocks
```

## Troubleshooting

Se os dados mockados estiverem aparecendo em produção:

1. Verifique se todas as importações estão usando `loadMockData()` em vez de importação direta.
2. Verifique se `NEXT_PUBLIC_USE_MOCKS` está configurado como 'false' em produção.
3. Limpe a cache do Next.js removendo a pasta `.next`.
4. Reconstrua o projeto com `npm run build:no-mocks`.
5. Execute `npm run check-mocks` para verificar se as referências a mocks foram removidas.

## Adicionando Novos Dados Mockados

Para adicionar novos tipos de dados mockados:

1. Adicione a interface e os dados no arquivo `src/lib/mock-data.ts`.
2. Adicione uma função getter que também verifica o ambiente.
3. Atualize o tipo em `loadMockData<T>()` para incluir o novo tipo.
