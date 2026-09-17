export interface StoryboardFrame {
  id: number;
  title: string;
  scene: string;
  voiceover: string;
  duration: string;
  type?: string;
  status?: string;
}

export interface ParsedStoryboard {
  message?: string;
  duration?: string;
  arc?: string;
  stylePreset?: string;
  frames: StoryboardFrame[];
}

export function parseStoryboardMarkdown(content: string): ParsedStoryboard {
  const result: ParsedStoryboard = {
    frames: [],
  };

  if (!content) return result;

  // 1. Extract frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const fmLines = fmMatch[1].split('\n');
    for (const line of fmLines) {
      const [key, ...vals] = line.split(':');
      if (!key) continue;
      const val = vals.join(':').trim().replace(/^["']|["']$/g, '');
      const trimmedKey = key.trim();
      if (trimmedKey === 'message') result.message = val;
      if (trimmedKey === 'duration') result.duration = val;
      if (trimmedKey === 'arc') result.arc = val;
      if (trimmedKey === 'style_preset') result.stylePreset = val;
    }
  }

  // 2. Extract frames: ## Frame N — <Title>
  const frameRegex = /##\s+Frame\s+(\d+)\s*[—–-]\s*([^\r\n]+)([\s\S]*?)(?=(?:##\s+Frame\s+\d+|$))/gi;
  let match: RegExpExecArray | null;

  while ((match = frameRegex.exec(content)) !== null) {
    const frameId = parseInt(match[1], 10);
    const frameTitle = match[2].trim();
    const frameBody = match[3];

    let scene = '';
    let voiceover = '';
    let duration = '5.0s';
    let type = '';
    let status = 'outline';

    const sceneMatch = frameBody.match(/-\s+scene:\s*([^\r\n]+)/i);
    if (sceneMatch) scene = sceneMatch[1].trim();

    const voMatch = frameBody.match(/-\s+voiceover:\s*(?:["']?)([^"'\r\n]+)(?:["']?)/i);
    if (voMatch) voiceover = voMatch[1].trim();

    const durMatch = frameBody.match(/-\s+duration:\s*([^\r\n]+)/i);
    if (durMatch) duration = durMatch[1].trim();

    const typeMatch = frameBody.match(/-\s+type:\s*([^\r\n]+)/i);
    if (typeMatch) type = typeMatch[1].trim();

    const statusMatch = frameBody.match(/-\s+status:\s*([^\r\n]+)/i);
    if (statusMatch) status = statusMatch[1].trim();

    result.frames.push({
      id: frameId,
      title: frameTitle,
      scene: scene || frameTitle,
      voiceover: voiceover || 'Narration cue',
      duration,
      type,
      status,
    });
  }

  return result;
}