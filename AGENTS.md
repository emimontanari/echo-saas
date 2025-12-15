# Code Review Rules

## TypeScript

- Use `const` and `let`, never `var`
- No `any` types - always use proper typing
- Prefer interfaces over type aliases for objects
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## React

- Functional components only, no class components
- No `import * as React` - use named imports
- Use semantic HTML elements
- All images need alt text
- Interactive elements need aria labels

## Styling

- Use Tailwind CSS utilities
- No inline styles
- No hex colors - use design tokens

## Testing

- All new features need tests
- Test files must be co-located with source files
- Use descriptive test names that explain the behavior
