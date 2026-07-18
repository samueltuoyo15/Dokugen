import type {CSSProperties, ReactNode} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const colors = {
  ink: '#18181b',
  muted: '#71717a',
  paper: '#fafafa',
  white: '#ffffff',
  line: '#e4e4e7',
  purple: '#7c3aed',
  purpleSoft: '#ede9fe',
  yellow: '#facc15',
  yellowSoft: '#fef9c3',
  green: '#10b981',
  greenSoft: '#d1fae5',
  blue: '#0ea5e9',
  blueSoft: '#e0f2fe',
  rose: '#f43f5e',
};

const sans = 'Arial, Helvetica, sans-serif';
const mono = 'Consolas, "Courier New", monospace';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const ease = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const fadeWindow = (frame: number, duration: number, fade = 14) => {
  const enter = interpolate(frame, [0, fade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [duration - fade, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(enter, exit);
};

const Scene = ({children, duration}: {children: ReactNode; duration: number}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeWindow(frame, duration)}}>
      {children}
    </AbsoluteFill>
  );
};

const GridBackground = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.22) % 48;
  return (
    <AbsoluteFill style={{backgroundColor: colors.paper, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: -60,
          transform: `translate(${drift}px, ${drift}px)`,
          opacity: 0.42,
          backgroundSize: '48px 48px',
          backgroundImage:
            'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: 0, width: 18, height: '100%', backgroundColor: colors.purple}} />
      <div style={{position: 'absolute', right: 0, top: 0, width: 18, height: '100%', backgroundColor: colors.yellow}} />
      {Array.from({length: 16}).map((_, index) => {
        const x = 80 + ((index * 151 + frame * (0.4 + (index % 3) * 0.1)) % 1760);
        const y = 45 + ((index * 97 + frame * (0.18 + (index % 4) * 0.05)) % 990);
        const size = index % 3 === 0 ? 8 : 5;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: index % 4 === 0 ? colors.yellow : colors.purple,
              opacity: 0.18,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Eyebrow = ({children, color = colors.purple}: {children: ReactNode; color?: string}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: mono,
      fontSize: 20,
      fontWeight: 700,
      textTransform: 'uppercase',
      color,
      letterSpacing: 0,
    }}
  >
    <span style={{width: 34, height: 4, backgroundColor: color}} />
    {children}
  </div>
);

const Wordmark = ({compact = false}: {compact?: boolean}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: compact ? 15 : 26}}>
    <Img
      src={staticFile('smile_logo.svg')}
      style={{width: compact ? 54 : 104, height: compact ? 50 : 96, objectFit: 'contain'}}
    />
    <span
      style={{
        fontFamily: sans,
        fontWeight: 900,
        fontSize: compact ? 38 : 78,
        color: colors.ink,
        letterSpacing: 0,
      }}
    >
      Dokugen
    </span>
  </div>
);

const Pill = ({label, color, background}: {label: string; color: string; background: string}) => (
  <div
    style={{
      padding: '13px 20px',
      borderRadius: 6,
      border: `2px solid ${color}`,
      backgroundColor: background,
      color,
      fontFamily: mono,
      fontSize: 21,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

const BrowserChrome = ({children, title = 'README.md'}: {children: ReactNode; title?: string}) => (
  <div
    style={{
      backgroundColor: colors.white,
      border: `2px solid ${colors.line}`,
      borderRadius: 8,
      boxShadow: '0 24px 70px rgba(24, 24, 27, 0.14)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: `2px solid ${colors.line}`,
        backgroundColor: '#f4f4f5',
      }}
    >
      <div style={{display: 'flex', gap: 10}}>
        {[colors.rose, colors.yellow, colors.green].map((color) => (
          <span key={color} style={{width: 14, height: 14, borderRadius: '50%', backgroundColor: color}} />
        ))}
      </div>
      <div style={{margin: '0 auto', fontFamily: mono, fontSize: 18, color: colors.muted}}>{title}</div>
      <div style={{width: 62}} />
    </div>
    {children}
  </div>
);

const StaleReadme = () => {
  const frame = useCurrentFrame();
  const opacity = ease(frame, 8, 16);
  const shake = frame > 45 && frame < 55 ? Math.sin(frame * 2.7) * 6 : 0;
  return (
    <div style={{opacity, transform: `translateX(${shake}px)`}}>
      <BrowserChrome>
        <div style={{padding: 32, height: 378, fontFamily: mono}}>
          <div style={{fontSize: 32, fontWeight: 800, marginBottom: 24}}>Project Orion</div>
          {[
            ['Last updated', '47 commits ago'],
            ['Architecture', 'missing'],
            ['Install steps', 'outdated'],
            ['API reference', 'TODO'],
          ].map(([label, value], index) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '17px 0',
                borderBottom: `1px solid ${colors.line}`,
                fontSize: 20,
                color: colors.muted,
                opacity: ease(frame, 16 + index * 7, 12),
              }}
            >
              <span>{label}</span>
              <span style={{color: index === 0 ? colors.rose : colors.muted}}>{value}</span>
            </div>
          ))}
        </div>
      </BrowserChrome>
    </div>
  );
};

const HookScene = () => {
  const frame = useCurrentFrame();
  const left = ease(frame, 0, 22);
  return (
    <Scene duration={105}>
      <div style={{position: 'absolute', left: 128, top: 142, width: 760}}>
        <Eyebrow color={colors.rose}>The documentation problem</Eyebrow>
        <h1
          style={{
            fontFamily: sans,
            fontSize: 104,
            lineHeight: 0.98,
            margin: '36px 0 30px',
            color: colors.ink,
            fontWeight: 900,
            letterSpacing: 0,
            transform: `translateY(${(1 - left) * 60}px)`,
            opacity: left,
          }}
        >
          Your code moves fast.
        </h1>
        <div
          style={{
            display: 'inline-block',
            padding: '13px 18px',
            backgroundColor: colors.yellow,
            color: colors.ink,
            fontFamily: sans,
            fontWeight: 900,
            fontSize: 44,
            transform: `rotate(-1.5deg) scale(${0.92 + ease(frame, 32, 14) * 0.08})`,
            opacity: ease(frame, 28, 12),
          }}
        >
          Your README doesn’t.
        </div>
      </div>
      <div style={{position: 'absolute', right: 110, top: 160, width: 710}}>
        <StaleReadme />
      </div>
    </Scene>
  );
};

const BrandScene = () => {
  const frame = useCurrentFrame();
  const pop = ease(frame, 0, 25);
  const line = ease(frame, 22, 24);
  return (
    <Scene duration={150}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${(1 - pop) * 55}px) scale(${0.88 + pop * 0.12})`, opacity: pop}}>
          <Wordmark />
        </div>
        <div
          style={{
            marginTop: 42,
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 55,
            color: colors.ink,
            opacity: line,
          }}
        >
          Documentation that keeps up.
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 36, opacity: ease(frame, 50, 20)}}>
          <Pill label="README.md" color={colors.purple} background={colors.purpleSoft} />
          <Pill label="commits" color={colors.blue} background={colors.blueSoft} />
          <Pill label="licenses" color={colors.rose} background="#ffe4e6" />
          <Pill label="diagrams" color={colors.green} background={colors.greenSoft} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const TerminalLine = ({children, color = '#d4d4d8', style}: {children: ReactNode; color?: string; style?: CSSProperties}) => (
  <div style={{fontFamily: mono, fontSize: 24, lineHeight: 1.65, color, ...style}}>{children}</div>
);

const TerminalScene = () => {
  const frame = useCurrentFrame();
  const command = 'dokugen';
  const typed = command.slice(0, Math.floor(clamp((frame - 18) / 20) * command.length));
  const scan = clamp((frame - 48) / 90);
  const completed = frame >= 142;
  const panelIn = ease(frame, 0, 22);
  return (
    <Scene duration={300}>
      <div style={{position: 'absolute', left: 96, top: 78}}>
        <Wordmark compact />
      </div>
      <div style={{position: 'absolute', left: 100, top: 208, width: 1080, transform: `translateX(${(1 - panelIn) * -80}px)`, opacity: panelIn}}>
        <BrowserChrome title="~/project-orion">
          <div style={{height: 640, backgroundColor: '#18181b', padding: '42px 48px'}}>
            <TerminalLine color="#a1a1aa">samuel@dev project-orion % <span style={{color: '#fafafa'}}>{typed}</span><span style={{color: colors.yellow, opacity: frame % 18 < 9 ? 1 : 0}}>▋</span></TerminalLine>
            <div style={{height: 28}} />
            <TerminalLine style={{opacity: ease(frame, 45, 10)}} color={colors.purpleSoft}>◆ Dokugen is reading your codebase</TerminalLine>
            <div style={{height: 18}} />
            {[
              ['Detecting stack', 'React + TypeScript'],
              ['Mapping architecture', '12 modules'],
              ['Writing sections', '8 complete'],
              ['Rendering diagram', 'system-flow.mmd'],
            ].map(([label, value], index) => {
              const visible = ease(frame, 55 + index * 22, 12);
              const done = scan > (index + 1) / 4;
              return (
                <TerminalLine key={label} style={{opacity: visible}} color="#a1a1aa">
                  <span style={{color: done ? colors.green : colors.yellow}}>{done ? '✓' : '·'}</span>{'  '}{label.padEnd(24, ' ')}
                  <span style={{color: '#fafafa'}}>{value}</span>
                </TerminalLine>
              );
            })}
            <div style={{height: 26}} />
            <div style={{height: 10, width: 720, backgroundColor: '#3f3f46', borderRadius: 2, overflow: 'hidden', opacity: ease(frame, 52, 10)}}>
              <div style={{height: '100%', width: `${scan * 100}%`, backgroundColor: colors.yellow}} />
            </div>
            {completed ? (
              <div style={{marginTop: 34, padding: '22px 26px', border: `1px solid ${colors.green}`, backgroundColor: '#052e16', opacity: ease(frame, 142, 14)}}>
                <TerminalLine color="#a7f3d0">✓ README.md generated in 12.4s</TerminalLine>
              </div>
            ) : null}
          </div>
        </BrowserChrome>
      </div>
      <div style={{position: 'absolute', right: 92, top: 220, width: 560}}>
        <Eyebrow>One command</Eyebrow>
        <h2 style={{fontFamily: sans, fontSize: 72, lineHeight: 1.04, fontWeight: 900, margin: '28px 0 24px', color: colors.ink, opacity: ease(frame, 24, 18)}}>
          From codebase to clarity.
        </h2>
        <p style={{fontFamily: sans, fontSize: 28, lineHeight: 1.45, color: colors.muted, margin: 0, opacity: ease(frame, 52, 18)}}>
          Scan the project. Understand the stack. Generate the README, architecture, and onboarding path.
        </p>
        <div style={{marginTop: 48, opacity: ease(frame, 160, 20)}}>
          <Pill label="zero config · no login · no API key" color={colors.green} background={colors.greenSoft} />
        </div>
      </div>
    </Scene>
  );
};

const Callout = ({title, detail, color, top, delay}: {title: string; detail: string; color: string; top: number; delay: number}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, delay, 18);
  return (
    <div
      style={{
        position: 'absolute',
        right: 85,
        top,
        width: 470,
        padding: '25px 28px',
        border: `2px solid ${color}`,
        borderRadius: 6,
        backgroundColor: colors.white,
        boxShadow: '0 16px 40px rgba(24,24,27,0.10)',
        transform: `translateX(${(1 - p) * 90}px)`,
        opacity: p,
      }}
    >
      <div style={{fontFamily: sans, fontWeight: 900, color: colors.ink, fontSize: 28}}>{title}</div>
      <div style={{fontFamily: sans, color: colors.muted, fontSize: 21, marginTop: 8, lineHeight: 1.35}}>{detail}</div>
    </div>
  );
};

const DemoScene = () => {
  const frame = useCurrentFrame();
  const zoom = 0.95 + ease(frame, 0, 30) * 0.05;
  return (
    <Scene duration={210}>
      <div style={{position: 'absolute', left: 96, top: 78}}>
        <Eyebrow color={colors.blue}>See the workflow</Eyebrow>
      </div>
      <div style={{position: 'absolute', left: 92, top: 142, width: 1220, transform: `scale(${zoom})`, transformOrigin: 'left center'}}>
        <BrowserChrome title="Dokugen in action">
          <div style={{height: 755, backgroundColor: '#0f172a', overflow: 'hidden'}}>
            <Video
              src={staticFile('Demo.mp4')}
              muted
              playbackRate={1.1}
              style={{width: '100%', height: '100%', objectFit: 'contain'}}
            />
          </div>
        </BrowserChrome>
      </div>
      <Callout title="Smart updates" detail="Refresh generated sections. Keep every custom note." color={colors.green} top={212} delay={32} />
      <Callout title="System diagrams" detail="Turn the codebase into a readable architecture map." color={colors.purple} top={404} delay={70} />
      <Callout title="Quality commits" detail="Create Conventional Commits from the actual diff." color={colors.blue} top={596} delay={108} />
    </Scene>
  );
};

const FeatureTile = ({title, command, color, x, y, delay}: {title: string; command: string; color: string; x: number; y: number; delay: number}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, delay, 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 430,
        height: 190,
        padding: '28px 30px',
        boxSizing: 'border-box',
        backgroundColor: colors.white,
        border: `2px solid ${color}`,
        borderRadius: 6,
        transform: `translateY(${(1 - p) * 45}px)`,
        opacity: p,
      }}
    >
      <div style={{width: 46, height: 8, backgroundColor: color, marginBottom: 25}} />
      <div style={{fontFamily: sans, fontSize: 31, fontWeight: 900, color: colors.ink}}>{title}</div>
      <div style={{fontFamily: mono, fontSize: 20, color: colors.muted, marginTop: 15}}>$ {command}</div>
    </div>
  );
};

const FeaturesScene = () => {
  const frame = useCurrentFrame();
  const languages = ['React', 'Python', 'Go', 'Rust', 'Java', 'PHP', 'Django', 'C++'];
  return (
    <Scene duration={150}>
      <div style={{position: 'absolute', left: 110, top: 112, width: 660}}>
        <Eyebrow color={colors.green}>Built for real repos</Eyebrow>
        <h2 style={{fontFamily: sans, fontSize: 78, lineHeight: 1.02, fontWeight: 900, color: colors.ink, margin: '30px 0 24px', opacity: ease(frame, 0, 22)}}>
          One tool. The whole documentation loop.
        </h2>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 38, width: 600}}>
          {languages.map((language, index) => (
            <div
              key={language}
              style={{
                padding: '10px 15px',
                border: `1px solid ${colors.line}`,
                backgroundColor: index % 3 === 0 ? colors.yellowSoft : colors.white,
                color: colors.ink,
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 20,
                opacity: ease(frame, 36 + index * 5, 12),
              }}
            >
              {language}
            </div>
          ))}
        </div>
      </div>
      <FeatureTile title="Generate" command="dokugen generate" color={colors.purple} x={820} y={125} delay={12} />
      <FeatureTile title="Update safely" command="dokugen update" color={colors.green} x={1280} y={125} delay={22} />
      <FeatureTile title="Write the commit" command="dokugen aic" color={colors.blue} x={820} y={345} delay={32} />
      <FeatureTile title="License the work" command="dokugen license" color={colors.rose} x={1280} y={345} delay={42} />
      <div
        style={{
          position: 'absolute',
          left: 820,
          top: 590,
          width: 890,
          padding: '30px 34px',
          boxSizing: 'border-box',
          backgroundColor: colors.ink,
          color: colors.white,
          borderRadius: 6,
          opacity: ease(frame, 58, 20),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{fontFamily: sans, fontSize: 29, fontWeight: 800}}>Incremental scanning</span>
        <span style={{fontFamily: mono, fontSize: 27, color: '#a7f3d0'}}>only changed files → milliseconds</span>
      </div>
    </Scene>
  );
};

const FinalScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 22);
  return (
    <Scene duration={60}>
      <AbsoluteFill style={{backgroundColor: colors.ink}}>
        <div style={{position: 'absolute', left: 120, top: 125, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
          <Wordmark />
        </div>
        <div style={{position: 'absolute', left: 122, top: 300, color: colors.white, fontFamily: sans, fontSize: 68, fontWeight: 900, lineHeight: 1.08}}>
          Build the product.<br />Dokugen keeps it readable.
        </div>
        <div
          style={{
            position: 'absolute',
            left: 122,
            bottom: 136,
            padding: '24px 32px',
            width: 730,
            backgroundColor: '#27272a',
            border: '1px solid #52525b',
            borderRadius: 6,
            color: '#fafafa',
            fontFamily: mono,
            fontSize: 29,
          }}
        >
          <span style={{color: colors.green}}>$</span> npm install -g dokugen
        </div>
        <div style={{position: 'absolute', right: 120, top: 180, width: 650, height: 650, backgroundColor: colors.yellow, borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{fontFamily: mono, fontSize: 23, fontWeight: 700, color: '#713f12', textTransform: 'uppercase'}}>Free · Open source · Zero config</div>
          <div style={{fontFamily: sans, fontSize: 49, fontWeight: 900, color: colors.ink, marginTop: 30, textAlign: 'center', lineHeight: 1.1}}>dokugen.<br />samueltuoyo.com</div>
          <div style={{width: 110, height: 6, backgroundColor: colors.ink, marginTop: 48}} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

export const DokugenLaunch = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{fontFamily: sans}}>
      <GridBackground />
      <Audio
        src={staticFile('dokugen-score.wav')}
        volume={(frame: number) =>
          interpolate(frame, [0, fps, 28 * fps, 30 * fps], [0, 0.92, 0.92, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      <Sequence from={0} durationInFrames={105} premountFor={fps}>
        <HookScene />
      </Sequence>
      <Sequence from={90} durationInFrames={150} premountFor={fps}>
        <BrandScene />
      </Sequence>
      <Sequence from={225} durationInFrames={300} premountFor={fps}>
        <TerminalScene />
      </Sequence>
      <Sequence from={510} durationInFrames={210} premountFor={fps}>
        <DemoScene />
      </Sequence>
      <Sequence from={705} durationInFrames={150} premountFor={fps}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={840} durationInFrames={60} premountFor={fps}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};
