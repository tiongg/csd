# Frontend code rules

- Use `cn` for conditional class names.
- Use `useApiQuery` and `useApiMutation` for API calls. Refer to @AuthContext for examples on how to make and invalidate API calls.
- Backend API types are generated into `api.d.ts`. Refer to @utils.ts for examples on how to extract types from the generated API client.
- Split into smaller logical components as much as possible. Each component should ideally be in its own file.
- Use Tailwind CSS for styling. Follow the existing design patterns in the codebase.
- Avoid dead code and commented-out code. Remove any code that is no longer needed.
- Only add comments where necessary to explain complex logic or decisions. Do not add comments for jsx sections.
- Follow the existing file structure and organization of the codebase. If adding new features, create new files or folders as needed to keep the code organized.
