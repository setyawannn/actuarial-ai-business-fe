# 02 - Design System and App Shell

## Tujuan
Membangun sistem UI operasional yang konsisten dengan shadcn/ui, Tailwind CSS, dan kebutuhan aplikasi business intelligence.

## Implementation Checklist
- Gunakan shadcn/ui sebagai primitive utama: button, input, textarea, select, form, badge, alert, tabs, table, separator, skeleton, dialog, dropdown-menu, sonner, scroll-area, tooltip, progress.
- Gunakan lucide-react untuk icon button dan navigation icon.
- Buat layout shell: `AppShell`, `AppSidebar`, `TopNav`, `PageHeader`, `ProtectedPage`, `AdminOnly`.
- Buat route group untuk area auth dan app: login tanpa shell penuh, app pages dengan sidebar/topnav.
- Sediakan state UI untuk loading, empty, error, unauthorized, dan not found.
- Hindari landing page marketing; halaman pertama app harus mengarah ke workflow utama seperti dashboard atau analysis.
- Desain dashboard padat, mudah discan, dan tidak terlalu dekoratif.

## UI Rules
- Button icon pakai icon familiar dan tooltip bila makna tidak jelas.
- Card hanya untuk item berulang, panel data, modal, atau tool surface; jangan nested card.
- Text harus responsive dan tidak overlap di mobile maupun desktop.
- Palette harus profesional dan tidak satu warna monoton.
- Gunakan Server Components by default; Client Components hanya untuk form, query, tabs, toast, editor, dan interaksi.

## Acceptance Criteria
- Shell konsisten untuk `/dashboard`, `/analysis/*`, dan `/admin/*`.
- Login page tetap bersih tanpa sidebar protected.
- Semua state dasar tersedia sebelum integrasi API.
- UI siap dipakai untuk module analysis, report, sources, history, dan admin.
