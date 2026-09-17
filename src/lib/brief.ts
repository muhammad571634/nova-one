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

  const intentText =
    config.intent === 'show_site'
      ? `Show the site as-is at ${config.url} and walk through its features.`
      : `Promote the product at ${config.url} to prospective customers.`;

  const notes = [
    '- Created by the Nova One app; the user answers checkpoints in the app, not in chat.',
  ];

  if (!cleanMessage) {
    notes.push(
      '- message not provided — derive it from the captured site and state it in STORYBOARD.md'
    );
  }

  return `${frontmatterLines.join('\n')}

## Intent

${intentText}
Source URL: ${config.url}

## Customizations

- Narration: yes, ${config.voice || 'female'} voice.
- Captions: on.

## Notes

${notes.join('\n')}
`;
}