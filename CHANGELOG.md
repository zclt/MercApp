# Changelog

## [18.0.0] - 2026-02-10

### 🚀 Major Update - Angular 18 Migration

#### 📦 Dependencies Updated
- **Angular Framework**: 14.1.0 → 18.0.0
  - `@angular/animations`: ^14.1.0 → ^18.0.0
  - `@angular/cdk`: ^14.1.0 → ^18.0.0
  - `@angular/common`: ^14.1.0 → ^18.0.0
  - `@angular/compiler`: ^14.1.0 → ^18.0.0
  - `@angular/core`: ^14.1.0 → ^18.0.0
  - `@angular/forms`: ^14.1.0 → ^18.0.0
  - `@angular/material`: ^14.1.0 → ^18.0.0
  - `@angular/platform-browser`: ^14.1.0 → ^18.0.0
  - `@angular/platform-browser-dynamic`: ^14.1.0 → ^18.0.0
  - `@angular/router`: ^14.1.0 → ^18.0.0

- **Development Tools**: 
  - `@angular-devkit/build-angular`: ^14.2.13 → ^18.0.0
  - `@angular/cli`: ^14.2.13 → ^18.0.0
  - `@angular/compiler-cli`: ^14.1.0 → ^18.0.0

- **Core Dependencies**:
  - `typescript`: ~4.7.2 → ~5.4.0
  - `@types/node`: ^16.18.122 → ^20.0.0
  - `rxjs`: ~7.5.0 → ~7.8.0
  - `zone.js`: ~0.11.4 → ~0.14.0
  - `@types/jasmine`: ~4.0.0 → ~5.1.0
  - `jasmine-core`: ~4.2.0 → ~5.1.0

#### 🔧 Configuration Changes
- **TypeScript Target**: `es2020` → `ES2022`
- **TypeScript Module**: `es2020` → `ES2022`
- **TypeScript Library**: `["es2020", "dom"]` → `["ES2022", "dom"]`

#### 🐛 Breaking Changes Fixed
- **Material Components**: 
  - `mat-chip-list` → `mat-chip-set` (Angular Material 18 breaking change)
  - Fixed color attribute syntax: `color="~primary"` → `color="primary"`

#### 🛠️ Development Server
- Added `allowedHosts` configuration to resolve "Invalid Host/Origin header" errors
- Updated dev server options for better compatibility with Angular 18

#### ⚠️ Deprecations & Warnings
- `@angular/flex-layout`: Updated to ^15.0.0-beta.42 (deprecated package)
  - **Recommendation**: Consider migrating to native CSS Grid/Flexbox
- `browserTarget` option deprecated in favor of `buildTarget`
- Build budget warning: 792.73 kB exceeds recommended 512 kB

#### 🔒 Security
- 33 vulnerabilities detected (run `npm audit fix` to address)
- Updated to latest secure versions of all dependencies

#### 📁 Backup
- Original project backed up to `MercApp_backup_20260210_1207XX`

---

## [0.0.0] - Initial Version

### 🎯 Project Setup
- Angular 14.1.0 initial setup
- Material Design components integration
- Flex Layout for responsive design
- Basic shopping cart functionality
- Todo list integration

---

## Migration Summary

### ✅ What Works
- Application builds successfully
- Development server runs without errors
- All core functionality preserved
- Material components updated and working

### 🔄 Next Steps Recommended
1. **Security**: Run `npm audit fix` to address vulnerabilities
2. **Performance**: Optimize bundle size (currently 792.73 kB)
3. **Modernization**: Replace deprecated `@angular/flex-layout`
4. **Testing**: Verify all application features work correctly
5. **Documentation**: Update README with new requirements (Node.js 18+)

### 📊 Impact
- **Security**: Improved with latest dependency versions
- **Performance**: Enhanced with Angular 18 optimizations
- **Compatibility**: Updated for modern Node.js environments
- **Maintainability**: Current framework version for long-term support
