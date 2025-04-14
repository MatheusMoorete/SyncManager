/**
 * Script para verificar se a build de produção contém referências a dados mockados
 * Executar com: npm run check-mocks
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Verificando referências a dados mockados na build de produção...\n')

// Lista de termos para procurar nos arquivos da build
const termsToSearch = [
  'mockCustomers',
  'mockServices',
  'mockAppointments',
  'mockReceipts',
  'mockExpenses',
  'getMockCustomers',
  'getMockServices',
  'getMockAppointments',
  'getMockReceipts',
  'getMockExpenses',
  'mock-data.ts',
  'mock-data.js',
]

// Caminho para a pasta da build
const buildPath = path.join(__dirname, '..', '.next')

// Verifica se a pasta .next existe
if (!fs.existsSync(buildPath)) {
  console.error('❌ A pasta .next não existe. Execute primeiro npm run build')
  process.exit(1)
}

// Função para verificar recursivamente todos os arquivos em uma pasta
function searchInDirectory(directory) {
  const foundReferences = []

  // Procura em todos os arquivos .js da build
  try {
    const result = execSync(
      `grep -r "${termsToSearch.join('\\|')}" ${directory} --include="*.js"`,
      {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'], // Captura stdout, ignora stderr
      }
    )

    if (result) {
      result.split('\n').forEach(line => {
        if (line.trim()) {
          foundReferences.push(line)
        }
      })
    }
  } catch (error) {
    // grep retorna um código de saída não-zero quando não encontra correspondências
    if (error.status !== 1) {
      console.error('Erro ao executar grep:', error)
    }
  }

  return foundReferences
}

const references = searchInDirectory(buildPath)

if (references.length === 0) {
  console.log('✅ Nenhuma referência a dados mockados encontrada na build!\n')
  console.log('A build está pronta para produção.\n')
  process.exit(0)
} else {
  console.error('❌ Encontradas referências a dados mockados na build:\n')
  references.forEach(ref => {
    console.error(`- ${ref}`)
  })
  console.error('\nA build NÃO está pronta para produção. Corrija as importações e reconstrua.\n')
  process.exit(1)
}
