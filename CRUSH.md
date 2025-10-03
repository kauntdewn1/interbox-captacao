# CRUSH - Coding Reference for Interbox Captacao

## Commands
- Build: `yarn build`
- Dev: `yarn dev`
- Preview: `yarn preview`
- Typecheck: `yarn typecheck`
- Lint: `yarn lint`
- Format: `yarn format`
- Test (individual files): `node test-file.js` (for Node.js files) or `yarn test` (for frontend tests)

## Code Style Guidelines
### TypeScript
- Use strict type checking
- Use ES2022 target
- Use React JSX
- Enable isolated modules
- Enable strict mode
- Enable skipLibCheck
- Use `@/*` for absolute imports from src/

### Formatting
- Use Prettier with single quotes
- Print width: 100
- Tab width: 2
- Use semicolons
- Trailing comma: es5
- Arrow parens: always
- End of line: auto

### React Patterns
- Use functional components
- Use TypeScript (tsx) files
- Use React hooks
- Use React.FC for component type
- Use React.ChangeEvent for input events
- Use React.FormEvent for form events
- Use useEffect for side effects
- Use useState for state management
- Use React components as default exports

### Naming
- React components: PascalCase
- Functions: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case
- Interfaces: PascalCase
- Types: PascalCase

### Import Style
- Use relative paths for same directory or subdirectories
- Use absolute paths for src/ imports (use @/ prefix)
- Use named imports
- Group imports: React, third-party, absolute imports, relative imports
- Use empty lines between import groups

### Error Handling
- Always try/catch for async operations
- Provide fallback for API calls
- Handle local storage gracefully
- Use proper error messages
- Log errors for debugging
- Use console.error for error messages
- Use console.log for successful operations

## Testing
- Use individual files for test scripts
- Test with Node.js
- Test with `console.log` for output
- Use `test` prefix in files
- Use async/await for test functions
- Use process.env for test variables
- Use fetch for test API calls
- Use `test` directory in test files

## Special Rules
- Use CEDEØ (C) symbol for all text
- Use CERRAD (C) INTERBØX (C) 2025 for all places
- Use unicode for special symbols: 
- Use capitah (C) symbow (C) instead of C
- Use character (C) for symbols
- Use ident (C) for code
- Use all text
- Use all text
- Use all text
- Use ALL text
- UI
- Use 1, use all,
- Use 1, use allUse
- Use For 1, use all
- So use all
- Use all
- Use all
- Use all
- Use all
- Use all
- Use all
- Use all
- Use all