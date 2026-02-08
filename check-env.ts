// check-env.ts
import * as fs from 'fs'
import * as path from 'path'

console.log('=== Проверка окружения ===')

// Текущая директория
const currentDir = process.cwd()
console.log('1. Текущая директория:', currentDir)

// Проверяем .env файл
const envPath = path.join(currentDir, '.env')
console.log('2. Путь к .env:', envPath)
console.log('3. .env существует:', fs.existsSync(envPath))

// Содержимое .env
if (fs.existsSync(envPath)) {
  console.log('4. Содержимое .env:')
  console.log(fs.readFileSync(envPath, 'utf8'))
} else {
  console.log('4. .env не найден!')
}

// Переменные окружения
console.log('5. DATABASE_URL из process.env:', process.env.DATABASE_URL)
console.log('6. Все env переменные:', Object.keys(process.env).length, 'переменных')

// Проверяем загрузку dotenv
try {
  require('dotenv').config()
  console.log('7. dotenv загружен')
  console.log('8. DATABASE_URL после dotenv:', process.env.DATABASE_URL)
} catch (e) {
  console.log('7. dotenv не установлен')
}