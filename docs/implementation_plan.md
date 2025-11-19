# Implementation Plan - Refinement & Optimization

## Goal Description
Improve the robustness and user experience of the NumerAI platform by enhancing test coverage for core numerology logic and implementing better error handling in the frontend.

## User Review Required
> [!IMPORTANT]
> This plan focuses on technical debt and polish. No new features are being added, but existing logic will be more rigorously tested.

## Proposed Changes

### Backend - Test Coverage
#### [MODIFY] [test_numerology.py](file:///Users/burhanahmed/Desktop/NumerAI/backend/core/tests/test_numerology.py)
- Add tests for 'Y' as a vowel vs. consonant (edge case).
- Add tests for specific master number reduction scenarios (e.g., 11, 22, 33 in intermediate steps).
- Add tests for `karmic_debt_number` calculation (currently missing in `test_numerology.py`).
- Add tests for `hidden_passion_number` and `subconscious_self_number`.
- Add tests for `calculate_all` with edge case names.

### Frontend - Error Handling
#### [NEW] [ErrorBoundary.tsx](file:///Users/burhanahmed/Desktop/NumerAI/frontend/src/components/ErrorBoundary.tsx)
- Create a React Error Boundary component to catch runtime errors in the component tree.
- Display a user-friendly fallback UI instead of crashing the app.

#### [MODIFY] [layout.tsx](file:///Users/burhanahmed/Desktop/NumerAI/frontend/src/app/layout.tsx)
- Wrap the main application content with the new `ErrorBoundary`.

#### [MODIFY] [numerology-api.ts](file:///Users/burhanahmed/Desktop/NumerAI/frontend/src/lib/numerology-api.ts)
- Add better error handling in API calls (e.g., try-catch blocks with user-friendly error messages).
- Implement a toast notification for API errors (using `sonner` or existing toast lib).

## Verification Plan

### Automated Tests
- Run `python manage.py test core.tests.test_numerology` to verify new backend tests.
- Run frontend build `npm run build` to ensure no type errors.

### Manual Verification
- Trigger a backend error (e.g., by temporarily breaking an endpoint) and verify the frontend displays a toast/error message gracefully.
- Verify that numerology calculations remain accurate with the new tests.
