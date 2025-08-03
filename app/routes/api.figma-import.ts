import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

interface FigmaImportRequest {
  figmaUrl: string;
  accessToken: string;
  includeAssets?: boolean;
  generateComponents?: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'svelte';
  cssFramework?: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion';
}

interface FigmaImportResponse {
  success: boolean;
  files?: Record<string, string>;
  components?: FigmaComponent[];
  assets?: FigmaAsset[];
  error?: string;
}

interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  code: string;
  styles: string;
  properties: Record<string, any>;
}

interface FigmaAsset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'font';
  url: string;
  format: string;
}

// Extract Figma file ID from URL
function extractFigmaFileId(url: string): string | null {
  const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Convert Figma color to CSS
function convertFigmaColor(color: any): string {
  if (!color) {
    return '#000000';
  }

  const { r, g, b, a = 1 } = color;
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);

  if (a < 1) {
    return `rgba(${red}, ${green}, ${blue}, ${a})`;
  }

  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

// Generate component code based on framework
function generateComponentCode(component: any, framework: string, cssFramework: string): string {
  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '');

  switch (framework) {
    case 'react':
      return generateReactComponent(component, componentName, cssFramework);
    case 'vue':
      return generateVueComponent(component, componentName, cssFramework);
    case 'angular':
      return generateAngularComponent(component, componentName, cssFramework);
    case 'svelte':
      return generateSvelteComponent(component, componentName, cssFramework);
    default:
      return generateReactComponent(component, componentName, cssFramework);
  }
}

function generateReactComponent(component: any, name: string, cssFramework: string): string {
  const styles = generateStyles(component, cssFramework);

  return `import React from 'react';
${cssFramework === 'styled-components' ? "import styled from 'styled-components';" : ''}

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

 ${cssFramework === 'styled-components' ? `// Styled component would be generated here` : ''}

export const ${name}: React.FC<${name}Props> = ({ className, children, ...props }) => {
  return (
    <div 
      className={\`${generateTailwindClasses(component)} \${className}\`}
      ${cssFramework === 'css-modules' ? `style={${JSON.stringify(styles)}}` : ''}
      {...props}
    >
      {children}
    </div>
  );
};

export default ${name};

${
  cssFramework === 'css-modules'
    ? `
/* ${name}.module.css */
.${name.toLowerCase()} {
${Object.entries(styles)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}
`
    : ''
}`;
}

function generateVueComponent(component: any, name: string, cssFramework: string): string {
  const styles = generateStyles(component, cssFramework);

  return `<template>
  <div 
    :class="[\`${generateTailwindClasses(component)}\`, className]"
    ${cssFramework === 'css-modules' ? ':style="componentStyles"' : ''}
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string;
}

defineProps<Props>();

${
  cssFramework === 'css-modules'
    ? `
const componentStyles = ${JSON.stringify(styles, null, 2)};
`
    : ''
}
</script>

${
  cssFramework !== 'tailwind' && cssFramework !== 'css-modules'
    ? `
<style scoped>
.${name.toLowerCase()} {
${Object.entries(styles)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}
</style>
`
    : ''
}`;
}

function generateAngularComponent(component: any, name: string, cssFramework: string): string {
  const styles = generateStyles(component, cssFramework);

  return `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <div 
      [class]="${generateTailwindClasses(component)} {{ className }}"
      ${cssFramework === 'css-modules' ? '[ngStyle]="componentStyles"' : ''}
    >
      <ng-content></ng-content>
    </div>
  \`,
  ${
    cssFramework !== 'tailwind' && cssFramework !== 'css-modules'
      ? `
  styles: [\`
    .${name.toLowerCase()} {
${Object.entries(styles)
  .map(([key, value]) => `      ${key}: ${value};`)
  .join('\n')}
    }
  \`]
  `
      : 'styles: []'
  }
})
export class ${name}Component {
  @Input() className?: string;
  
  ${
    cssFramework === 'css-modules'
      ? `
  componentStyles = ${JSON.stringify(styles, null, 2)};
  `
      : ''
  }
}`;
}

function generateSvelteComponent(component: any, name: string, cssFramework: string): string {
  const styles = generateStyles(component, cssFramework);

  return `<script lang="ts">
  export let className: string = '';
</script>

<div 
  class="${generateTailwindClasses(component)} {className}"
  ${
    cssFramework === 'css-modules'
      ? `style="${Object.entries(styles)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')}"`
      : ''
  }
>
  <slot />
</div>

${
  cssFramework !== 'tailwind' && cssFramework !== 'css-modules'
    ? `
<style>
  .${name.toLowerCase()} {
${Object.entries(styles)
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
  }
</style>
`
    : ''
}`;
}

function generateStyles(component: any, _cssFramework: string): Record<string, string> {
  const styles: Record<string, string> = {};

  if (component.absoluteBoundingBox) {
    styles.width = `${component.absoluteBoundingBox.width}px`;
    styles.height = `${component.absoluteBoundingBox.height}px`;
  }

  if (component.fills && component.fills[0]) {
    const fill = component.fills[0];

    if (fill.type === 'SOLID') {
      styles.backgroundColor = convertFigmaColor(fill.color);
    }
  }

  if (component.strokes && component.strokes[0]) {
    const stroke = component.strokes[0];
    styles.border = `${component.strokeWeight || 1}px solid ${convertFigmaColor(stroke.color)}`;
  }

  if (component.cornerRadius) {
    styles.borderRadius = `${component.cornerRadius}px`;
  }

  if (component.effects) {
    component.effects.forEach((effect: any) => {
      if (effect.type === 'DROP_SHADOW') {
        styles.boxShadow = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${convertFigmaColor(effect.color)}`;
      }
    });
  }

  return styles;
}

function generateTailwindClasses(component: any): string {
  const classes: string[] = [];

  // Layout classes
  if (component.layoutMode === 'HORIZONTAL') {
    classes.push('flex', 'flex-row');
  } else if (component.layoutMode === 'VERTICAL') {
    classes.push('flex', 'flex-col');
  }

  // Spacing classes
  if (component.paddingLeft || component.paddingTop || component.paddingRight || component.paddingBottom) {
    const padding = component.paddingLeft || component.paddingTop || component.paddingRight || component.paddingBottom;

    if (padding <= 4) {
      classes.push(`p-${padding}`);
    } else if (padding <= 16) {
      classes.push(`p-${Math.round(padding / 4)}`);
    } else {
      classes.push(`p-${Math.round(padding / 4)}`);
    }
  }

  // Background color
  if (component.fills && component.fills[0] && component.fills[0].type === 'SOLID') {
    const color = component.fills[0].color;

    if (color.r === 1 && color.g === 1 && color.b === 1) {
      classes.push('bg-white');
    } else if (color.r === 0 && color.g === 0 && color.b === 0) {
      classes.push('bg-black');
    } else {
      classes.push('bg-gray-500');
    } // Default for custom colors
  }

  // Border radius
  if (component.cornerRadius) {
    if (component.cornerRadius <= 4) {
      classes.push(`rounded-${component.cornerRadius === 2 ? 'sm' : component.cornerRadius === 4 ? '' : 'none'}`);
    } else if (component.cornerRadius >= 20) {
      classes.push('rounded-full');
    } else {
      classes.push('rounded-lg');
    }
  }

  return classes.join(' ');
}

async function fetchFigmaFile(fileId: string, accessToken: string) {
  const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  return response.json();
}

async function fetchFigmaImages(fileId: string, nodeIds: string[], accessToken: string) {
  const idsParam = nodeIds.join(',');
  const response = await fetch(`https://api.figma.com/v1/images/${fileId}?ids=${idsParam}&format=png&scale=2`, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma Images API error: ${response.statusText}`);
  }

  return response.json();
}

function traverseNodes(node: any, components: FigmaComponent[], framework: string, cssFramework: string) {
  if (node.type === 'COMPONENT' || node.type === 'FRAME' || node.type === 'GROUP') {
    const component: FigmaComponent = {
      id: node.id,
      name: node.name,
      type: node.type,
      code: generateComponentCode(node, framework, cssFramework),
      styles: JSON.stringify(generateStyles(node, cssFramework), null, 2),
      properties: {
        width: node.absoluteBoundingBox?.width,
        height: node.absoluteBoundingBox?.height,
        x: node.absoluteBoundingBox?.x,
        y: node.absoluteBoundingBox?.y,
      },
    };

    components.push(component);
  }

  if (node.children) {
    node.children.forEach((child: any) => {
      traverseNodes(child, components, framework, cssFramework);
    });
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const importRequest: FigmaImportRequest = await request.json();
    const {
      figmaUrl,
      accessToken,
      includeAssets = true,
      generateComponents = true,
      framework = 'react',
      cssFramework = 'tailwind',
    } = importRequest;

    // Extract file ID from Figma URL
    const fileId = extractFigmaFileId(figmaUrl);

    if (!fileId) {
      return json({ success: false, error: 'Invalid Figma URL' }, { status: 400 });
    }

    // Fetch Figma file data
    const figmaData = (await fetchFigmaFile(fileId, accessToken)) as any;

    const components: FigmaComponent[] = [];
    const assets: FigmaAsset[] = [];
    const files: Record<string, string> = {};

    // Traverse nodes and extract components
    if (generateComponents && figmaData.document) {
      traverseNodes(figmaData.document, components, framework, cssFramework);
    }

    // Generate component files
    components.forEach((component) => {
      const fileName = `${component.name.replace(/[^a-zA-Z0-9]/g, '')}.${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}`;
      files[`components/${fileName}`] = component.code;
    });

    // Fetch images if requested
    if (includeAssets && components.length > 0) {
      try {
        const nodeIds = components.map((c) => c.id);
        const imagesData = (await fetchFigmaImages(fileId, nodeIds, accessToken)) as any;

        if (imagesData.images) {
          Object.entries(imagesData.images).forEach(([nodeId, imageUrl]) => {
            const component = components.find((c) => c.id === nodeId);

            if (component && imageUrl) {
              assets.push({
                id: nodeId,
                name: component.name,
                type: 'image',
                url: imageUrl as string,
                format: 'png',
              });
            }
          });
        }
      } catch (error) {
        console.warn('Failed to fetch images:', error);
      }
    }

    // Generate index file
    const componentImports = components
      .map((c) => {
        const componentName = c.name.replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `${componentName}.${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}`;

        return `export { default as ${componentName} } from './${fileName}';`;
      })
      .join('\n');

    files['components/index.ts'] = componentImports;

    // Generate README
    files['FIGMA_IMPORT_README.md'] = `# Figma Import

This project was imported from Figma using the Figma API.

## Components Generated

${components.map((c) => `- **${c.name}** (${c.type})`).join('\n')}

## Framework: ${framework}
## CSS Framework: ${cssFramework}

## Usage

\`\`\`${framework === 'vue' ? 'vue' : framework === 'svelte' ? 'svelte' : 'tsx'}
import { ${components.map((c) => c.name.replace(/[^a-zA-Z0-9]/g, '')).join(', ')} } from './components';
\`\`\`

## Assets

${assets.length > 0 ? assets.map((a) => `- ${a.name}: ${a.url}`).join('\n') : 'No assets exported.'}

## Notes

- Components are generated based on Figma design tokens
- Styles are converted to ${cssFramework} classes/styles
- Images are exported as PNG format at 2x resolution
`;

    const response: FigmaImportResponse = {
      success: true,
      files,
      components,
      assets,
    };

    return json(response);
  } catch (error) {
    console.error('Figma import error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
