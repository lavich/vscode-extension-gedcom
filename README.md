# VS Code GEDCOM Validator Extension

Расширение для VS Code, которое предоставляет поддержку языка GEDCOM с валидацией в реальном времени.

## Возможности

- ✅ Подсветка синтаксиса для файлов GEDCOM
- ✅ Валидация в реальном времени
- ✅ Поддержка GEDCOM 7.0
- ✅ Отображение ошибок и предупреждений
- ✅ Автодополнение

## Установка зависимостей

```bash
npm run install:all
```

## Компиляция

```bash
# Компиляция клиентской и серверной части
npm run compile

# Компиляция только клиентской части
npm run compile:client

# Компиляция только серверной части
npm run compile:server
```

## Запуск в режиме отладки

### Способ 1: Через VS Code

1. Откройте проект в VS Code
2. Нажмите `F5` или выберите "Run Extension" в меню отладки
3. Откроется новое окно VS Code с загруженным расширением
4. Откройте файл `test.ged` для проверки валидации

### Способ 2: Через командную строку

```bash
# Скомпилируйте проект
npm run compile

# Запустите VS Code с расширением
code --extensionDevelopmentPath=/path/to/your/extension
```

## Тестирование

1. Откройте файл `test.ged` в VS Code
2. Попробуйте изменить файл - вы должны увидеть ошибки валидации в реальном времени
3. Проверьте, что подсветка синтаксиса работает

## Структура проекта

```
vscode-extension-gedcom/
├── client/                 # Клиентская часть расширения
│   ├── src/
│   │   └── extension.ts   # Основной файл расширения
│   ├── syntaxes/
│   │   └── gedcom.tmLanguage.json  # Синтаксис GEDCOM
│   └── package.json
├── server/                 # Серверная часть (Language Server)
│   ├── server.ts          # Language Server
│   ├── validator.ts       # Валидатор GEDCOM
│   ├── g7structure.ts     # Структуры GEDCOM 7
│   ├── g7lookups.ts       # Справочники GEDCOM 7
│   ├── gedcstruct.ts      # Структуры GEDC
│   └── package.json
├── .vscode/
│   ├── launch.json        # Конфигурация отладки
│   └── tasks.json         # Задачи сборки
├── test.ged               # Тестовый файл
└── package.json
```

## Настройки

Расширение поддерживает следующие настройки:

- `gedcomLanguageServer.maxNumberOfProblems` - Максимальное количество проблем (по умолчанию: 1000)
- `gedcomLanguageServer.enableG7Validation` - Включить валидацию GEDCOM 7 (по умолчанию: true)
- `gedcomLanguageServer.includeWarnings` - Включить предупреждения (по умолчанию: true)

## Разработка

### Добавление новых правил валидации

1. Отредактируйте файл `server/validator.ts`
2. Добавьте новые проверки в метод `validate()`
3. Перекомпилируйте проект: `npm run compile`

### Изменение синтаксиса

1. Отредактируйте файл `client/syntaxes/gedcom.tmLanguage.json`
2. Перезапустите VS Code

## Упаковка расширения

```bash
npm run package
```

Это создаст `.vsix` файл, который можно установить в VS Code.

## Публикация

```bash
npm run publish
```

## Лицензия

Apache-2.0 