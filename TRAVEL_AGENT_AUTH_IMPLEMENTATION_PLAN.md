# ACI Air B2B OTA — Travel Agent Authentication Implementation Plan

## 1. Objective

Build a polished, responsive Travel Agent authentication and onboarding experience for the ACI Air B2B OTA platform using Next.js.

The implementation will cover:

1. Travel Agent sign in
2. Forgot password entry point
3. Travel Agent registration
4. Partner information collection
5. Verification-document upload
6. Final review and submission
7. Email verification and pending-approval states

Personal User and Corporate User flows are explicitly out of scope for this phase.

## 2. Reference audit

The supplied reference set contains:

- [Sign-in reference](<login_signup_page_ref/Screenshot 2026-09-03 at 7.20.31ΓÇ»PM.png>)
- [Travel Agent registration — Partner Information](<login_signup_page_ref/Screenshot 2026-09-03 at 7.21.51ΓÇ»PM.png>)
- [Travel Agent registration — Upload Documents](<login_signup_page_ref/Screenshot 2026-09-03 at 7.22.22ΓÇ»PM.png>)
- [Travel Agent registration — Final Check and Submission](<login_signup_page_ref/Screenshot 2026-09-03 at 7.23.01ΓÇ»PM.png>)
- [ACI Air logo](<login_signup_page_ref/logo.jpg>)

### Observed design language

- Sign in uses a centered white card over a pale blue-gray background.
- The card has generous spacing, rounded corners, and a soft shadow.
- Registration uses a wider desktop container with three numbered accordion-like sections.
- Travel Agent is the active account type.
- Primary registration controls use a dark indigo/purple color.
- Required labels are shown in red.
- Input fields use a very light gray fill with indigo borders and text.
- The sign-in reference includes Google and Facebook buttons; these should remain optional until the B2B authentication policy is confirmed.

## 3. Product decisions to lock before coding

These decisions affect both UI and API contracts and should be confirmed with the product/backend owners:

| Decision | Recommended Travel Agent behavior |
|---|---|
| Account type | Show only `Travel Agent` in this release, or display it as a non-editable selected type. |
| Login identity | Use partner email as the primary identifier. |
| Social login | Prefer Google Workspace/business SSO; keep Facebook hidden unless explicitly required. |
| Approval | Show a clear “Pending verification” state after registration. |
| Required documents | NID and Trade License required; CAAB Certificate optional, based on the reference. |
| Upload-later behavior | Allow it only for documents approved by the business process. |
| Password policy | Confirm minimum length, complexity, expiry, and lockout requirements. |
| Currency | Default to BDT, but keep the field data-driven for future markets. |
| Geography | Default country to Bangladesh and populate city/area options from API data. |

## 4. Recommended technical baseline

Use the following baseline unless the repository already has an established standard:

- Next.js with App Router and TypeScript
- React Hook Form for form state and field registration
- Zod for shared validation schemas
- Tailwind CSS or CSS Modules, using one consistent styling approach
- `next/image` for the logo and decorative imagery
- Lucide or another approved icon library
- Auth.js/NextAuth or the existing backend session mechanism
- Playwright for end-to-end browser tests
- Vitest or Jest for unit/component tests
- axe-based accessibility checks

Use server components by default. Mark only interactive forms, step navigation, password visibility controls, selects, and upload controls as client components.

## 5. Phase 0 — Repository and environment setup

### Tasks

1. Confirm whether a Next.js application exists.
2. If this is a new application, initialize it with TypeScript, ESLint, App Router, and the chosen styling system.
3. Add environment variable conventions for API base URL, authentication configuration, upload configuration, and analytics.
4. Add a `.env.example` without secrets.
5. Configure path aliases such as `@/components`, `@/lib`, and `@/styles`.
6. Add formatting and linting rules.
7. Add a CI command sequence for type checking, linting, tests, and production build.
8. Create a short README section explaining how to run the auth flow locally.

### Initial verification

The baseline application must:

- Start successfully in development mode.
- Pass TypeScript checking.
- Pass linting.
- Produce a production build.
- Render correctly without backend connectivity by using a documented mock mode.

## 6. Phase 1 — Asset and brand foundation

### Logo handling

1. Preserve the supplied ACI Air logo as the source reference.
2. Confirm whether an official vector logo exists before production release.
3. If only the supplied JPG is available, prepare an optimized PNG/WebP fallback and avoid stretching it.
4. Use a transparent version on light surfaces and an approved light version on dark surfaces.
5. Keep the logo aspect ratio locked and define minimum display sizes.

### Provisional brand tokens

The logo visually contains deep green, bright green, white, and orange. The following values are starting tokens only; final values should be sampled from the approved logo file or brand guidelines.

```css
:root {
  --aci-green-950: #003b24;
  --aci-green-900: #004d2d;
  --aci-green-700: #008d4d;
  --aci-green-500: #00a651;
  --aci-orange-500: #f58220;
  --aci-orange-600: #dc6e12;

  --auth-background: #f2f7f5;
  --surface: #ffffff;
  --surface-muted: #f7f9f8;
  --text-primary: #12352a;
  --text-secondary: #64746d;
  --border: #d5e1db;
  --focus: #00a651;
  --error: #c62828;
  --success: #087f47;

  --radius-control: 8px;
  --radius-card: 16px;
  --shadow-card: 0 16px 40px rgb(0 59 36 / 12%);
}
```

### Design principle

The brand green should be the dominant action and identity color. Orange should be used as a supporting accent for emphasis, status, or small brand details—not as the default color for every button. This keeps the interface aligned with the logo while preserving hierarchy and accessibility.

## 7. Phase 2 — Information architecture and routes

Create the following routes:

```text
app/
  (auth)/
    layout.tsx
    sign-in/page.tsx
    sign-up/travel-agent/page.tsx
    forgot-password/page.tsx
    verify-email/page.tsx
    registration-submitted/page.tsx
```

Suggested route behavior:

- `/sign-in` — email/password login.
- `/sign-up/travel-agent` — three-step Travel Agent onboarding.
- `/forgot-password` — request reset email.
- `/verify-email` — verification guidance and resend action.
- `/registration-submitted` — pending review confirmation.

Protect post-authenticated pages using the established session strategy and redirect authenticated users away from sign in where appropriate.

## 8. Phase 3 — Shared authentication shell

Create a reusable `AuthShell` with:

- Full-height responsive layout.
- ACI Air logo area.
- Light green-tinted background.
- Optional low-opacity travel/city illustration.
- Centered content container.
- Consistent page padding and card behavior.
- Mobile-safe vertical scrolling.

### Desktop composition

- Sign-in card: approximately 560–640px wide.
- Registration card: approximately 1,000–1,160px wide.
- Content vertically centered where the viewport permits.
- Decorative illustration positioned behind the content and never allowed to reduce contrast.

### Mobile composition

- One-column form layout.
- Reduced decorative artwork or no artwork.
- Full-width card with safe horizontal padding.
- Step navigation remains visible and touch-friendly.

## 9. Phase 4 — Sign-in page design and implementation

### Page structure

1. ACI Air logo.
2. Heading: `Please sign in`.
3. Supporting text explaining that sign-in is required to continue.
4. Optional business SSO buttons.
5. Divider labeled `Or sign in with`.
6. Email input.
7. Password input with visibility toggle.
8. Forgot-password link.
9. Green primary `Sign In` button.
10. Footer prompt: `Don't have an account? Sign Up`.

### Component breakdown

```text
AuthShell
└── SignInCard
    ├── BrandLogo
    ├── SocialAuthButtons (optional)
    ├── AuthDivider
    ├── SignInForm
    │   ├── EmailField
    │   ├── PasswordField
    │   └── SubmitButton
    └── AuthFooterLink
```

### Interaction states

Design and implement all of the following:

- Empty form.
- Focused field.
- Valid field.
- Invalid email format.
- Missing password.
- Incorrect credentials.
- Loading/submitting.
- Disabled submit button.
- Locked or temporarily blocked account.
- Email-not-verified response.
- Network/server failure.
- Successful redirect to the OTA dashboard.

Never expose whether a specific email exists during password-recovery or account lookup flows.

## 10. Phase 5 — Travel Agent registration shell

Use a three-step flow matching the references:

1. Partner Information
2. Upload Documents
3. Final Check and Submission

Only one step should be expanded at a time. Completed steps should remain editable. Incomplete or blocked steps should expose the reason clearly.

### Stepper behavior

- Use numbered indicators.
- Use green for the active/completed state.
- Use muted green-gray for inactive states.
- Use red only for required or invalid messaging.
- Keep the step title clickable only when the step is available.
- Announce step changes for screen readers.

## 11. Phase 6 — Partner Information form

### Required fields from the reference

| Field | Control | Rule |
|---|---|---|
| Owner Full Name | Text input | Required; match government ID where applicable. |
| Company Name | Text input | Required for a Travel Agent partner. |
| Address | Textarea/input | Required; preserve enough length for a full business address. |
| Phone Number | Country-code phone input | Required; validate format and country code. |
| Country/Region | Select | Default Bangladesh; data-driven. |
| City/Area | Select | Required; dependent on selected country. |
| Currency | Select | Default BDT; data-driven. |
| Partner Email | Email input | Required; used for login and verification. |
| Password | Password input | Required; show requirements and visibility control. |

### UX details

- Use visible labels above all controls.
- Show required markers consistently.
- Keep related fields in two columns on desktop.
- Collapse to one column below the tablet breakpoint.
- Add helper text for government-ID name matching.
- Preserve form values when navigating between steps.
- Prevent duplicate submissions.

### Validation

Implement a Zod schema with:

- Trimmed string values.
- Email normalization.
- Password confirmation if required by the backend.
- Phone-number validation.
- Required select values.
- Maximum lengths for text fields.
- A clear error message for every invalid field.

The frontend validation is for experience; the backend must validate the same rules authoritatively.

## 12. Phase 7 — Document upload form

### Required uploads

- NID — required.
- Trade License — required.
- CAAB Certificate — optional according to the reference.

### Upload component behavior

Each upload control should support:

- Browse button.
- Drag and drop on desktop.
- Native file picker on mobile.
- Accepted file-type guidance.
- Maximum file-size guidance.
- Upload progress.
- Successful file preview with name and size.
- Replace and remove actions.
- File validation error.
- Upload retry.
- Upload-later checkbox where business rules allow it.

Recommended accepted formats should be confirmed with backend owners; PDF, JPG, JPEG, and PNG are reasonable candidates.

### Security requirements

- Validate file type and size on the client and server.
- Upload through signed URLs or a dedicated document endpoint.
- Do not trust file extensions alone.
- Do not expose private document URLs publicly.
- Avoid persisting sensitive files in browser storage.
- Display a privacy notice explaining how verification documents are used.

## 13. Phase 8 — Final review and submission

Render the submitted values in compact review cards, matching the reference layout.

Review groups:

- Partner identity.
- Contact information.
- Location and currency.
- Uploaded documents.

Incomplete values should be visually obvious and linked back to the relevant step. The submit button must remain disabled until all required data and documents are valid.

On submit:

1. Lock the form to prevent duplicate requests.
2. Show a progress state.
3. Submit the registration and document references.
4. Handle API validation errors at field and form level.
5. Redirect to the registration-submitted page on success.

## 14. Phase 9 — Responsive and visual QA

Test at minimum:

- 360px mobile width.
- 390px mobile width.
- 768px tablet width.
- 1024px laptop width.
- 1440px desktop width.
- Large desktop widths without excessive stretching.

Review:

- Card width and vertical rhythm.
- Logo clarity.
- Form alignment.
- Button hierarchy.
- Error-message wrapping.
- Stepper behavior.
- Upload controls on touch devices.
- Content overflow and keyboard scrolling.
- Contrast against the light background.

## 15. Phase 10 — Accessibility and quality gates

### Accessibility

- Use semantic forms and fieldsets.
- Associate every input with a label.
- Provide `aria-invalid` and `aria-describedby` for errors.
- Maintain visible focus styles using the brand green.
- Ensure contrast meets WCAG AA.
- Make all actions keyboard accessible.
- Do not use red text as the only error indicator.
- Announce async upload and submission states.

### Testing

Add tests for:

- Sign-in validation.
- Successful and failed sign in.
- Password visibility toggle.
- Step navigation.
- Back-navigation data persistence.
- Required document enforcement.
- File type and size validation.
- Review rendering.
- Duplicate-submit prevention.
- Registration success and API failure.
- Mobile layout smoke tests.

## 16. Suggested implementation order

1. Establish Next.js project and developer tooling.
2. Add logo assets and brand tokens.
3. Build `AuthShell` and base form primitives.
4. Implement the sign-in page visually.
5. Add sign-in validation and interaction states.
6. Build the Travel Agent stepper and registration layout.
7. Implement Partner Information fields and schema validation.
8. Implement document upload controls and upload states.
9. Implement review cards and submission behavior.
10. Add forgot-password and registration-success pages.
11. Connect backend authentication and registration APIs.
12. Run responsive, accessibility, and end-to-end QA.
13. Compare against the reference screenshots and complete visual refinements.

## 17. Definition of done

The Travel Agent auth experience is complete when:

- The UI is visually aligned with the supplied ACI Air references.
- Green is the dominant brand/action color and orange is used as a supporting accent.
- Sign in works with complete loading, error, and success states.
- Travel Agent registration works through all three steps.
- Required fields and documents cannot be skipped.
- Users can navigate backward without losing data.
- Registration errors are actionable and understandable.
- Sensitive documents are handled securely.
- The layout works across mobile, tablet, and desktop.
- The flow passes accessibility and automated test checks.
- The implementation is ready for backend integration without coupling API logic to presentational components.
