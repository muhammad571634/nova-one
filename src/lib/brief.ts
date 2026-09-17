export interface BriefConfig {
  url: string;
  intent: 'promote' | 'show_site';
  stylePreset: string;
  length: '30s' | '45s' | '60s';
  voice: 'female' | 'male';
  language: string;
  keyMessage?: string;
}

export function generateBriefMarkdown(config: BriefConfig): string {
  const frontmatterLines = [
    '---',
    'workflow: product-launch-video',
    'flow: automation',
    'storyboard: yes',
    'destination: website',
    'aspect: 1920x1080',
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

  return `${frontmatterLines.join('\n')}

## Intent

${intentText}
${hasUrl ? `Source URL: ${cleanUrl}` : `Source URL: none (pure prompt-driven video)`}

## Customizations

- Narration: yes, ${config.voice || 'female'} voice.
- Captions: on.

## Notes

${notes.join('\n')}
`;
}