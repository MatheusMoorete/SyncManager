#!/bin/bash

echo "🔍 Iniciando verificação do projeto..."

# Verificar dependências
echo "📦 Verificando dependências..."
npm install

# Rodar testes
echo "🧪 Executando testes..."
npm run test

# Verificar tipos
echo "📝 Verificando tipos..."
npm run type-check

# Rodar linter
echo "🔍 Executando linter..."
npm run lint

# Build do projeto
echo "🏗️ Realizando build..."
npm run build

# Verificar cobertura de testes
echo "📊 Verificando cobertura de testes..."
npm run test:coverage

echo "✅ Verificação concluída!" 