# Utility Libraries

This directory contains utility functions and constants used throughout the application.

## Category Mappings

The `category-mappings.ts` file contains mappings between UI category names and their corresponding filter values. This is used to ensure consistent filtering across the application.

### Category to Property Type Mapping

| UI Category Name | Property Types for Filtering |
|------------------|------------------------------|
| Individual Cabin | Individual Cabin |
| Coworking space | Coworking space |
| Co-Working Space | Coworking space |
| Meeting Area | Meeting Room |
| Board Room | Meeting Room |
| Raw space | Raw Space Office, Raw Space Lab |
| Cabins | Individual Cabin |
| Labs | Bio Allied, Manufacturing, Prototype Labs, Software |
| Equipment | Bio Allied, Manufacturing, Prototype Labs, SaaS Allied |
| Lab space | Bio Allied, Raw Space Lab |
| Machines | Manufacturing |
| Production | SaaS Allied, Manufacturing, Software |
| Manufacturing space | Manufacturing |
| Video | Studio |
| Podcasts | Studio |
| Edit | Studio |

### Usage

```typescript
import { getPropertyTypesForCategory, isCategoryForPropertyType } from '@/lib/category-mappings';

// Get property types for a category
const propertyTypes = getPropertyTypesForCategory('Labs');
// Returns: ['Bio Allied', 'Manufacturing', 'Prototype Labs', 'Software']

// Check if a property type belongs to a category
const isLabCategory = isCategoryForPropertyType('Labs', 'Bio Allied');
// Returns: true
```

This mapping is used in:
1. The search header component to map category clicks to the appropriate property types
2. The search page to expand categories to their corresponding property types 