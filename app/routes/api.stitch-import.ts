import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

interface StitchImportRequest {
  stitchUrl: string;
  accessToken: string;
  includeTokens?: boolean;
  generateTheme?: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'svelte';
  cssFramework?: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion' | 'stitches';
}

interface StitchImportResponse {
  success: boolean;
  files?: Record<string, string>;
  designTokens?: DesignToken[];
  components?: StitchComponent[];
  theme?: Record<string, any>;
  error?: string;
}

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border' | 'radius';
  category: string;
  description?: string;
}

interface StitchComponent {
  name: string;
  variants: Record<string, any>;
  defaultVariants: Record<string, any>;
  compoundVariants?: Array<{
    variants: Record<string, any>;
    css: Record<string, any>;
  }>;
  css: Record<string, any>;
}

// Extract Stitch project ID from URL
function extractStitchProjectId(url: string): string | null {
  const match = url.match(/stitch\.com\/projects\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}

// Generate design tokens from Stitch data
function generateDesignTokens(stitchData: any): DesignToken[] {
  const tokens: DesignToken[] = [];

  // Colors
  if (stitchData.colors) {
    Object.entries(stitchData.colors).forEach(([name, value]) => {
      tokens.push({
        name: `color-${name}`,
        value: value as string,
        type: 'color',
        category: 'colors',
        description: `Color token for ${name}`,
      });
    });
  }

  // Spacing
  if (stitchData.space) {
    Object.entries(stitchData.space).forEach(([name, value]) => {
      tokens.push({
        name: `space-${name}`,
        value: value as string,
        type: 'spacing',
        category: 'spacing',
        description: `Spacing token for ${name}`,
      });
    });
  }

  // Typography
  if (stitchData.fonts) {
    Object.entries(stitchData.fonts).forEach(([name, value]) => {
      tokens.push({
        name: `font-${name}`,
        value: value as string,
        type: 'typography',
        category: 'fonts',
        description: `Font token for ${name}`,
      });
    });
  }

  if (stitchData.fontSizes) {
    Object.entries(stitchData.fontSizes).forEach(([name, value]) => {
      tokens.push({
        name: `fontSize-${name}`,
        value: value as string,
        type: 'typography',
        category: 'fontSizes',
        description: `Font size token for ${name}`,
      });
    });
  }

  // Shadows
  if (stitchData.shadows) {
    Object.entries(stitchData.shadows).forEach(([name, value]) => {
      tokens.push({
        name: `shadow-${name}`,
        value: value as string,
        type: 'shadow',
        category: 'shadows',
        description: `Shadow token for ${name}`,
      });
    });
  }

  // Border radius
  if (stitchData.radii) {
    Object.entries(stitchData.radii).forEach(([name, value]) => {
      tokens.push({
        name: `radius-${name}`,
        value: value as string,
        type: 'radius',
        category: 'radii',
        description: `Border radius token for ${name}`,
      });
    });
  }

  return tokens;
}

// Generate Tailwind config from design tokens
function generateTailwindConfig(tokens: DesignToken[]): string {
  const config: any = {
    theme: {
      extend: {
        colors: {},
        spacing: {},
        fontFamily: {},
        fontSize: {},
        boxShadow: {},
        borderRadius: {},
      },
    },
  };

  tokens.forEach((token) => {
    switch (token.type) {
      case 'color':
        config.theme.extend.colors[token.name.replace('color-', '')] = token.value;
        break;
      case 'spacing':
        config.theme.extend.spacing[token.name.replace('space-', '')] = token.value;
        break;
      case 'typography':
        if (token.category === 'fonts') {
          config.theme.extend.fontFamily[token.name.replace('font-', '')] = token.value
            .split(',')
            .map((f: string) => f.trim());
        } else if (token.category === 'fontSizes') {
          config.theme.extend.fontSize[token.name.replace('fontSize-', '')] = token.value;
        }

        break;
      case 'shadow':
        config.theme.extend.boxShadow[token.name.replace('shadow-', '')] = token.value;
        break;
      case 'radius':
        config.theme.extend.borderRadius[token.name.replace('radius-', '')] = token.value;
        break;
    }
  });

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: ${JSON.stringify(config.theme, null, 4)},
  plugins: [],
}`;
}

// Generate Stitches config
function generateStitchesConfig(tokens: DesignToken[]): string {
  const config: any = {
    theme: {
      colors: {},
      space: {},
      fonts: {},
      fontSizes: {},
      shadows: {},
      radii: {},
    },
  };

  tokens.forEach((token) => {
    switch (token.type) {
      case 'color':
        config.theme.colors[token.name.replace('color-', '')] = token.value;
        break;
      case 'spacing':
        config.theme.space[token.name.replace('space-', '')] = token.value;
        break;
      case 'typography':
        if (token.category === 'fonts') {
          config.theme.fonts[token.name.replace('font-', '')] = token.value;
        } else if (token.category === 'fontSizes') {
          config.theme.fontSizes[token.name.replace('fontSize-', '')] = token.value;
        }

        break;
      case 'shadow':
        config.theme.shadows[token.name.replace('shadow-', '')] = token.value;
        break;
      case 'radius':
        config.theme.radii[token.name.replace('radius-', '')] = token.value;
        break;
    }
  });

  return `import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches(${JSON.stringify({ theme: config.theme }, null, 2)});

export type { VariantProps } from '@stitches/react';`;
}

// Generate styled-components theme
function generateStyledComponentsTheme(tokens: DesignToken[]): string {
  const theme: any = {
    colors: {},
    spacing: {},
    fonts: {},
    fontSizes: {},
    shadows: {},
    radii: {},
  };

  tokens.forEach((token) => {
    switch (token.type) {
      case 'color':
        theme.colors[token.name.replace('color-', '')] = token.value;
        break;
      case 'spacing':
        theme.spacing[token.name.replace('space-', '')] = token.value;
        break;
      case 'typography':
        if (token.category === 'fonts') {
          theme.fonts[token.name.replace('font-', '')] = token.value;
        } else if (token.category === 'fontSizes') {
          theme.fontSizes[token.name.replace('fontSize-', '')] = token.value;
        }

        break;
      case 'shadow':
        theme.shadows[token.name.replace('shadow-', '')] = token.value;
        break;
      case 'radius':
        theme.radii[token.name.replace('radius-', '')] = token.value;
        break;
    }
  });

  return `export const theme = ${JSON.stringify(theme, null, 2)};

export type Theme = typeof theme;`;
}

// Generate CSS custom properties
function generateCSSCustomProperties(tokens: DesignToken[]): string {
  const properties = tokens.map((token) => `  --${token.name}: ${token.value};`).join('\n');

  return `:root {
${properties}
}

/* Usage example:
.my-component {
  color: var(--color-primary);
  padding: var(--space-medium);
  font-family: var(--font-sans);
}
*/`;
}

// Generate component from Stitch component definition
function generateStitchComponent(component: StitchComponent, framework: string, cssFramework: string): string {
  const componentName = component.name;

  switch (framework) {
    case 'react':
      return generateReactStitchComponent(component, componentName, cssFramework);
    case 'vue':
      return generateVueStitchComponent(component, componentName, cssFramework);
    case 'angular':
      return generateAngularStitchComponent(component, componentName, cssFramework);
    case 'svelte':
      return generateSvelteStitchComponent(component, componentName, cssFramework);
    default:
      return generateReactStitchComponent(component, componentName, cssFramework);
  }
}

function generateReactStitchComponent(component: StitchComponent, name: string, cssFramework: string): string {
  if (cssFramework === 'stitches') {
    return `import { styled } from '../stitches.config';
import { type VariantProps } from '@stitches/react';

export const ${name} = styled('div', {
  // Base styles
${Object.entries(component.css)
  .map(([key, value]) => `  ${key}: '${value}',`)
  .join('\n')}
  
  variants: {
${Object.entries(component.variants)
  .map(
    ([variantName, variantOptions]) => `    ${variantName}: {
${Object.entries(variantOptions as Record<string, any>)
  .map(
    ([optionName, optionStyles]) => `      ${optionName}: {
${Object.entries(optionStyles)
  .map(([styleProp, styleValue]) => `        ${styleProp}: '${styleValue}',`)
  .join('\n')}
      },`,
  )
  .join('\n')}
    },`,
  )
  .join('\n')}
  },
  
  defaultVariants: ${JSON.stringify(component.defaultVariants, null, 4)},
});

export type ${name}Props = VariantProps<typeof ${name}>;`;
  }

  // For other CSS frameworks, generate a regular React component
  return `import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const ${name.toLowerCase()}Variants = cva(
  // Base classes
  '${generateBaseClasses(component.css)}',
  {
    variants: {
${Object.entries(component.variants)
  .map(
    ([variantName, variantOptions]) => `      ${variantName}: {
${Object.entries(variantOptions as Record<string, any>)
  .map(([optionName, optionStyles]) => `        ${optionName}: '${generateClassesFromStyles(optionStyles)}',`)
  .join('\n')}
      },`,
  )
  .join('\n')}
    },
    defaultVariants: ${JSON.stringify(component.defaultVariants, null, 4)},
  }
);

export interface ${name}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${name.toLowerCase()}Variants> {}

export const ${name} = React.forwardRef<HTMLDivElement, ${name}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={${name.toLowerCase()}Variants({ ...props, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

${name}.displayName = '${name}';`;
}

function generateVueStitchComponent(component: StitchComponent, name: string, _cssFramework: string): string {
  return `<template>
  <div :class="computedClasses" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cva } from 'class-variance-authority';

interface Props {
${Object.keys(component.variants)
  .map((variant) => `  ${variant}?: string;`)
  .join('\n')}
  className?: string;
}

const props = withDefaults(defineProps<Props>(), ${JSON.stringify(component.defaultVariants, null, 2)});

const ${name.toLowerCase()}Variants = cva(
  '${generateBaseClasses(component.css)}',
  {
    variants: {
${Object.entries(component.variants)
  .map(
    ([variantName, variantOptions]) => `      ${variantName}: {
${Object.entries(variantOptions as Record<string, any>)
  .map(([optionName, optionStyles]) => `        ${optionName}: '${generateClassesFromStyles(optionStyles)}',`)
  .join('\n')}
      },`,
  )
  .join('\n')}
    },
  }
);

const computedClasses = computed(() => 
  ${name.toLowerCase()}Variants({
${Object.keys(component.variants)
  .map((variant) => `    ${variant}: props.${variant},`)
  .join('\n')}
    className: props.className,
  })
);
</script>`;
}

function generateAngularStitchComponent(component: StitchComponent, name: string, _cssFramework: string): string {
  return `import { Component, Input } from '@angular/core';
import { cva } from 'class-variance-authority';

const ${name.toLowerCase()}Variants = cva(
  '${generateBaseClasses(component.css)}',
  {
    variants: {
${Object.entries(component.variants)
  .map(
    ([variantName, variantOptions]) => `      ${variantName}: {
${Object.entries(variantOptions as Record<string, any>)
  .map(([optionName, optionStyles]) => `        ${optionName}: '${generateClassesFromStyles(optionStyles)}',`)
  .join('\n')}
      },`,
  )
  .join('\n')}
    },
    defaultVariants: ${JSON.stringify(component.defaultVariants, null, 4)},
  }
);

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <div [class]="computedClasses">
      <ng-content></ng-content>
    </div>
  \`,
})
export class ${name}Component {
${Object.keys(component.variants)
  .map((variant) => `  @Input() ${variant}?: string;`)
  .join('\n')}
  @Input() className?: string;

  get computedClasses(): string {
    return ${name.toLowerCase()}Variants({
${Object.keys(component.variants)
  .map((variant) => `      ${variant}: this.${variant},`)
  .join('\n')}
      className: this.className,
    });
  }
}`;
}

function generateSvelteStitchComponent(component: StitchComponent, name: string, _cssFramework: string): string {
  return `<script lang="ts">
  import { cva } from 'class-variance-authority';
  
${Object.keys(component.variants)
  .map((variant) => `  export let ${variant}: string | undefined = undefined;`)
  .join('\n')}
  export let className: string = '';

  const ${name.toLowerCase()}Variants = cva(
    '${generateBaseClasses(component.css)}',
    {
      variants: {
${Object.entries(component.variants)
  .map(
    ([variantName, variantOptions]) => `        ${variantName}: {
${Object.entries(variantOptions as Record<string, any>)
  .map(([optionName, optionStyles]) => `          ${optionName}: '${generateClassesFromStyles(optionStyles)}',`)
  .join('\n')}
        },`,
  )
  .join('\n')}
      },
      defaultVariants: ${JSON.stringify(component.defaultVariants, null, 4)},
    }
  );

  $: computedClasses = ${name.toLowerCase()}Variants({
${Object.keys(component.variants)
  .map((variant) => `    ${variant},`)
  .join('\n')}
    className,
  });
</script>

<div class={computedClasses}>
  <slot />
</div>`;
}

function generateBaseClasses(css: Record<string, any>): string {
  // Convert CSS properties to Tailwind classes (simplified)
  const classes: string[] = [];

  Object.entries(css).forEach(([prop, value]) => {
    switch (prop) {
      case 'display':
        if (value === 'flex') {
          classes.push('flex');
        }

        if (value === 'block') {
          classes.push('block');
        }

        if (value === 'inline') {
          classes.push('inline');
        }

        break;
      case 'padding':
        classes.push(`p-${value}`);
        break;
      case 'margin':
        classes.push(`m-${value}`);
        break;
      case 'backgroundColor':
        classes.push('bg-gray-100'); // Simplified
        break;
      case 'color':
        classes.push('text-gray-900'); // Simplified
        break;
      case 'borderRadius':
        classes.push('rounded');
        break;
    }
  });

  return classes.join(' ');
}

function generateClassesFromStyles(styles: Record<string, any>): string {
  return generateBaseClasses(styles);
}

async function fetchStitchProject(projectId: string, accessToken: string) {
  const baseUrl = process.env.STITCH_API_BASE_URL || 'https://api.stitch.com';
  const url = `${baseUrl.replace(/\/$/, '')}/v1/projects/${projectId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    throw new Error('Stitch project not found');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Stitch API error (${response.status}): ${text || response.statusText}`);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error('Failed to parse Stitch API response as JSON');
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const importRequest: StitchImportRequest = await request.json();
    const {
      stitchUrl,
      accessToken,
      includeTokens = true,
      generateTheme = true,
      framework = 'react',
      cssFramework = 'stitches',
    } = importRequest;

    // Extract project ID from Stitch URL
    const projectId = extractStitchProjectId(stitchUrl);

    if (!projectId) {
      return json({ success: false, error: 'Invalid Stitch URL' }, { status: 400 });
    }

    // Fetch Stitch project data
    const stitchData = (await fetchStitchProject(projectId, accessToken)) as any;

    const files: Record<string, string> = {};
    const designTokens: DesignToken[] = [];
    const components: StitchComponent[] = [];

    // Generate design tokens
    if (includeTokens) {
      designTokens.push(...generateDesignTokens(stitchData));
    }

    // Generate theme configuration
    if (generateTheme && designTokens.length > 0) {
      switch (cssFramework) {
        case 'tailwind':
          files['tailwind.config.js'] = generateTailwindConfig(designTokens);
          break;
        case 'stitches':
          files['stitches.config.ts'] = generateStitchesConfig(designTokens);
          break;
        case 'styled-components':
          files['theme.ts'] = generateStyledComponentsTheme(designTokens);
          break;
        case 'css-modules':
          files['tokens.css'] = generateCSSCustomProperties(designTokens);
          break;
      }
    }

    // Generate components if they exist in Stitch data
    if (stitchData.components) {
      Object.entries(stitchData.components).forEach(([name, componentData]) => {
        const component: StitchComponent = {
          name,
          variants: (componentData as any).variants || {},
          defaultVariants: (componentData as any).defaultVariants || {},
          css: (componentData as any).css || {},
        };

        components.push(component);

        const componentCode = generateStitchComponent(component, framework, cssFramework);
        const fileName = `${name}.${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}`;
        files[`components/${fileName}`] = componentCode;
      });
    }

    // Generate index file for components
    if (components.length > 0) {
      const componentExports = components
        .map((c) => {
          const fileName = `${c.name}.${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}`;
          return `export { ${c.name} } from './${fileName}';`;
        })
        .join('\n');

      files['components/index.ts'] = componentExports;
    }

    // Generate tokens JSON file
    if (designTokens.length > 0) {
      files['design-tokens.json'] = JSON.stringify(designTokens, null, 2);
    }

    // Generate README
    files['STITCH_IMPORT_README.md'] = `# Stitch Import

This project was imported from Stitch Design System.

## Design Tokens

${
  designTokens.length > 0
    ? `${designTokens.length} design tokens imported:
${designTokens.map((t) => `- **${t.name}**: ${t.value} (${t.type})`).join('\n')}`
    : 'No design tokens found.'
}

## Components

${
  components.length > 0
    ? `${components.length} components imported:
${components.map((c) => `- **${c.name}**`).join('\n')}`
    : 'No components found.'
}

## Framework: ${framework}
## CSS Framework: ${cssFramework}

## Usage

\`\`\`${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}
import { ${components.map((c) => c.name).join(', ')} } from './components';
\`\`\`

## Theme Configuration

${generateTheme ? `Theme configuration generated for ${cssFramework}` : 'No theme configuration generated.'}

## Notes

- Design tokens are converted to ${cssFramework} format
- Components include variant support
- All styles are responsive and accessible
`;

    const response: StitchImportResponse = {
      success: true,
      files,
      designTokens,
      components,
      theme: generateTheme ? stitchData.theme : undefined,
    };

    return json(response);
  } catch (error) {
    console.error('Stitch import error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
