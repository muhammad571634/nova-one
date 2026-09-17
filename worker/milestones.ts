import fs from 'node:fs';
import path from 'node:path';

export interface MilestoneState {
  step: 'setup' | 'capture' | 'design' | 'storyboard' | 'building' | 'render' | 'ready';
  percentage: number;
  message: string;
  hasTokens: boolean;
  hasFrame: boolean;
  hasStoryboard: boolean;
  hasContactSheet: boolean;
  isBlocked: boolean;
  blockedReason?: string;
}

export function detectMilestones(projectDir: string): MilestoneState {
  const hyperframesJson = path.join(projectDir, 'hyperframes.json');
  const briefMd = path.join(projectDir, 'BRIEF.md');
  const tokensJson = path.join(projectDir, 'capture', 'extracted', 'tokens.json');
  const blockedMd = path.join(projectDir, 'capture', 'BLOCKED.md');
  const frameMd = path.join(projectDir, 'frame.md');
  const storyboardMd = path.join(projectDir, 'STORYBOARD.md');
  const contactSheet = path.join(projectDir, 'snapshots', 'contact-sheet.jpg');
  const videoMp4 = path.join(projectDir, 'renders', 'video.mp4');

  const hasSetup = fs.existsSync(hyperframesJson) || fs.existsSync(briefMd);
  const hasBlocked = fs.existsSync(blockedMd);
  const hasTokens = fs.existsSync(tokensJson);
  const hasFrame = fs.existsSync(frameMd);
  const hasStoryboard = fs.existsSync(storyboardMd);
  const hasContactSheet = fs.existsSync(contactSheet);
  const hasVideo = fs.existsSync(videoMp4);

  if (hasBlocked) {
    let reason = 'Site blocked crawler';
    try {
      reason = fs.readFileSync(blockedMd, 'utf8').slice(0, 200);
    } catch {
      // ignore
    }
    return {
      step: 'capture',
      percentage: 20,
      message: 'Website blocked automated asset extraction.',
      hasTokens: false,
      hasFrame: false,
      hasStoryboard: false,
      hasContactSheet: false,
      isBlocked: true,
      blockedReason: reason,
    };
  }

  if (hasVideo) {
    return {
      step: 'ready',
      percentage: 100,
      message: 'Video render complete.',
      hasTokens: true,
      hasFrame: true,
      hasStoryboard: true,
      hasContactSheet: true,
      isBlocked: false,
    };
  }

  if (hasContactSheet) {
    return {
      step: 'render',
      percentage: 85,
      message: 'Frames compiled and verified. Ready for render.',
      hasTokens: true,
      hasFrame: true,
      hasStoryboard: true,
      hasContactSheet: true,
      isBlocked: false,
    };
  }

  if (hasStoryboard) {
    return {
      step: 'storyboard',
      percentage: 60,
      message: 'Storyboard and script generated.',
      hasTokens: true,
      hasFrame: true,
      hasStoryboard: true,
      hasContactSheet: false,
      isBlocked: false,
    };
  }

  if (hasFrame) {
    return {
      step: 'design',
      percentage: 45,
      message: 'Design token palette and typography generated.',
      hasTokens: true,
      hasFrame: true,
      hasStoryboard: false,
      hasContactSheet: false,
      isBlocked: false,
    };
  }

  if (hasTokens) {
    return {
      step: 'capture',
      percentage: 30,
      message: 'Website visual assets and branding extracted.',
      hasTokens: true,
      hasFrame: false,
      hasStoryboard: false,
      hasContactSheet: false,
      isBlocked: false,
    };
  }

  if (hasSetup) {
    return {
      step: 'setup',
      percentage: 15,
      message: 'Workspace initialized and brief loaded.',
      hasTokens: false,
      hasFrame: false,
      hasStoryboard: false,
      hasContactSheet: false,
      isBlocked: false,
    };
  }

  return {
    step: 'setup',
    percentage: 5,
    message: 'Starting agent...',
    hasTokens: false,
    hasFrame: false,
    hasStoryboard: false,
    hasContactSheet: false,
    isBlocked: false,
  };
}