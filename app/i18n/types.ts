export type Lang = "en" | "zh";

export type Highlight = {
  phrase: string;
  kind: "signal" | "university" | "proof" | "metric";
  crest?: boolean;
};

export type HeroStatement = {
  full: string;
  compact: string;
  highlights: Highlight[];
  compactHighlights: Highlight[];
};

export type StoryStep = {
  label: string;
  title: string;
  explanation: string;
  annotation: string;
  /** Technical / AI keywords — painted solid. */
  annotationHighlights: readonly string[];
  /** Supporting phrases — marked with the lighter underline. */
  annotationSoftHighlights?: readonly string[];
  signals: readonly string[];
  maturity?: string;
  input: string;
  operation: string;
  output: string;
  stack: readonly string[];
  proof?: string;
};

export type ConclusionMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProjectIndexItem = {
  id: string;
  number: string;
  brand: string;
  category: string;
  badge: string;
  summary: string;
  proof: readonly string[];
  architecture: readonly string[];
  /** Visual accent key. Kept in the EN dictionary only because it is not translated. */
  accent?: "lime" | "violet" | "cyan" | "blue";
};

export type ChapterData = {
  brand: string;
  category: string;
  title: string;
  copy: string;
  proof: readonly ConclusionMetric[];
  steps: readonly StoryStep[];
  disclaimer?: { label: string; text: string };
};

export type ResearchItem = {
  badge: string;
  title: string;
  meta: string;
  copy: string;
  signals: readonly { label: string; value: string }[];
  stack: readonly string[];
  /** Visual / brand metadata. Kept in the EN dictionary only because it is not translated. */
  tone?: string;
  /** Visual index for the mini graphic. Kept in the EN dictionary only because it is not translated. */
  visual?: number;
  /** Optional partner logo. Kept in the EN dictionary only because it is not translated. */
  logo?: string;
};

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    subtitle: string;
    ariaLabel: string;
  };
  nav: {
    ariaLabel: string;
    profile: string;
    projects: string;
    antigravity: string;
    filmora: string;
    mindscape: string;
    research: string;
    contact: string;
  };
  common: {
    skipToContent: string;
  };
  resume: string;
  langSwitch: {
    en: string;
    zh: string;
    label: string;
  };
  hero: {
    name: string;
    terminalLabel: string;
    statusReady: string;
    statusDeleting: string;
    statusTyping: string;
    intro: string;
    statements: HeroStatement[];
    credentialListAria: string;
    actions: {
      projects: string;
      resume: string;
      github: string;
      contact: string;
    };
    skipIntro: string;
    scrollCue: string;
    contact: {
      aria: string;
      kicker: string;
      heading: string;
      call: string;
    };
    deck: {
      selectedSystems: string;
      explore: string;
      prev: string;
      next: string;
      showProject: string;
    };
    galaxyAnchors: [string, number, number][];
    galaxyClusters: { cx: number; cy: number; terms: [string, number, number][] }[];
  };
  profile: {
    headline: string;
    subheadline: string;
    staticView: string;
    pause: string;
    resume: string;
    whyLabel: string;
    capabilitiesDrawn: string;
    mapAria: string;
    targetRolesLabel: string;
    pillarsLabel: string;
    liveUpdate: string;
    roles: {
      id: string;
      lines: [string, string];
      short: string;
      why: string;
    }[];
    pillars: {
      id: string;
      label: string;
      /** Where this sits in the stack: product, reliability, model or infrastructure. */
      layer: string;
      skills: string[];
      draw: [number, number, number];
      /** Home-page sections that prove it. */
      proof: string[];
    }[];
    proofLabel: string;
    coverage: string;
    projectNames: Record<string, string>;
  };
  projects: {
    indexHeading: string;
    indexSubheading: string;
    indexSub: string;
    indexHint: string;
    cardFlowLabel: string;
    cardExplore: string;
    index: readonly ProjectIndexItem[];
    antigravity: ChapterData;
    filmora: ChapterData;
    mindscape: ChapterData;
    walkthrough: {
      componentMicroscope: string;
      highLevelArchitecture: string;
      architectureSignal: string;
      autoplay: string;
      ready: string;
      architectureComplete: string;
      continueToMicroscope: string;
      previousStage: string;
      nextStage: string;
      pauseWalkthrough: string;
      playWalkthrough: string;
      staticView: string;
      myContribution: string;
      input: string;
      operation: string;
      output: string;
      systemConclusion: string;
      conclusionSuffix: string;
      conclusionMetricPrefix: string;
      conclusionSignalsAria: string;
      conclusionSignalRailAria: string;
      fullSystemSignalRail: string;
      implementationSignal: string;
      implementationSignalFor: string;
      systemRevision: string;
      operationalGraphic: string;
      auto: string;
      manual: string;
      conclusion: string;
      conclusionStep: StoryStep;
    };
  };
  research: {
    heading: string;
    subheading: string;
    description: string;
    headingCont: string;
    subheadingCont: string;
    descriptionCont: string;
    playbackAriaLabel: string;
    pause: string;
    resume: string;
    staticView: string;
    recordAriaLabel: string;
    items: readonly ResearchItem[];
  };
  contact: {
    channels: Record<string, string>;
    dockAriaLabel: string;
    panelLabel: string;
    panelTitle: string;
    closePanel: string;
    openPanel: string;
    close: string;
    contactMe: string;
    openToRoles: string;
    heading: string;
    description: string;
    actions: {
      call: string;
      resume: string;
      github: string;
    };
    weChatNote: string;
    footerName: string;
    footerTagline: string;
    footerCredit: string;
    footerReturn: string;
  };
};
