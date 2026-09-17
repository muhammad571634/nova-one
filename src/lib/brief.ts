export interface BriefConfig {
  url: string;
  intent: 'promote' | 'show_site';
  stylePreset: string;
  length: '15s' | '30s' | '45s' | '60s';
  voice: 'female' | 'male';
  language: string;
  keyMessage?: string;
  aspect?: '1920x1080' | '1080x1920' | '1080x1080' | '16:9' | '9:16' | '1:1';
  captions?: boolean;
  brandColor?: string;
  brandName?: string;
}

export function normalizeAspect(aspect?: string): '1920x1080' | '1080x1920' | '1080x1080' {
  if (aspect === '9:16' || aspect === '1080x1920') return '1080x1920';
  if (aspect === '1:1' || aspect === '1080x1080') return '1080x1080';
  return '1920x1080';
}

export function aspectToLabel(aspect?: string): '16:9' | '9:16' | '1:1' {
  if (aspect === '9:16' || aspect === '1080x1920') return '9:16';
  if (aspect === '1:1' || aspect === '1080x1080') return '1:1';
  return '16:9';
}

export function generateBriefMarkdown(config: BriefConfig): string {
  const normAspect = normalizeAspect(config.aspect);
  const destination =
    normAspect === '1080x1920'
      ? 'tiktok'
      : normAspect === '1080x1080'
      ? 'social-feed'
      : 'website';

  const frontmatterLines = [
    '---',
    'workflow: product-launch-video',
    'flow: automation',
    'storyboard: yes',
    `destination: ${destination}`,
    `aspect: ${normAspect}`,
    `language: ${config.language || 'en'}`,
    `length: ${config.length || '45s'}`,
  ];

  if (config.stylePreset && config.stylePreset !== 'auto') {
    frontmatterLines.push(`style_preset: ${config.stylePreset}`);
  }

  const cleanMessage = config.keyMessage?.trim();
  if (cleanMessage) {
    frontmatterLines.push(`message: "${cleanMessage.replace(/"/g, '\\"')}"`);
  }

  frontmatterLines.push('---');

  const hasUrl = Boolean(config.url && config.url.trim());
  const cleanUrl = hasUrl ? config.url.trim() : '';

  const intentText = !hasUrl
    ? `Create an engaging launch video based purely on the provided prompt and instructions (no website scraping).`
    : config.intent === 'show_site'
    ? `Show the site as-is at ${cleanUrl} and walk through its features.`
    : `Promote the product at ${cleanUrl} to prospective customers.`;

  const notes = [
    '- Created by the Nova One app; the user answers checkpoints in the app, not in chat.',
  ];

  if (hasUrl) {
    if (!cleanMessage) {
      notes.push(
        '- message not provided — derive it from the captured site and state it in STORYBOARD.md'
      );
    }
  } else {
    notes.push(
      '- No website URL provided. Follow the Step 1 no-capture path: do not scrape any web page, use preset palette or custom colors, and generate script and scenes from the prompt message.'
    );
  }

  const cleanBrandColor = config.brandColor?.trim();
  if (cleanBrandColor) {
    notes.push(
      `- Primary Brand Color specified as ${cleanBrandColor}. Apply this accent across frame designs, highlights, and captions.`
    );
  }

  const cleanBrandName = config.brandName?.trim();
  if (cleanBrandName) {
    notes.push(`- Brand Identity: ${cleanBrandName}.`);
  }

  const customizations = [
    `- Narration: yes, ${config.voice || 'female'} voice.`,
    `- Captions: ${config.captions !== false ? 'on' : 'off'}.`,
  ];

  if (cleanBrandColor) {
    customizations.push(`- Brand Color: ${cleanBrandColor}`);
  }
  if (cleanBrandName) {
    customizations.push(`- Brand Name: ${cleanBrandName}`);
  }

  return `${frontmatterLines.join('\n')}

## Intent

${intentText}
${hasUrl ? `Source URL: ${cleanUrl}` : `Source URL: none (pure prompt-driven video)`}

## Customizations

${customizations.join('\n')}

## Notes

${notes.join('\n')}
`;
}