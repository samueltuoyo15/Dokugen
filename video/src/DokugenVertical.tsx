import type {ReactNode} from 'react';
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

const palette = {
  ink: '#0a0a09',
  charcoal: '#191917',
  paper: '#f5f0df',
  cream: '#e7dfc5',
  yellow: '#f3c83b',
  muted: '#a79f8e',
  line: '#3a3832',
  green: '#8bd3a1',
  red: '#ef6c5f',
};

const font = 'Aptos, "Segoe UI", sans-serif';
const mono = 'Cascadia Mono, "Aptos Mono", Consolas, monospace';

const ease = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Scene = ({children}: {children: ReactNode; duration: number}) => <AbsoluteFill>{children}</AbsoluteFill>;

const Grain = ({strength = 0.18}: {strength?: number}) => (
  <AbsoluteFill style={{overflow: 'hidden', opacity: strength, pointerEvents: 'none'}}>
    {Array.from({length: 108}).map((_, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: `${(index * 47 + 11) % 101}%`,
          top: `${(index * 73 + 7) % 101}%`,
          width: index % 5 === 0 ? 3 : 2,
          height: index % 5 === 0 ? 3 : 2,
          borderRadius: '50%',
          backgroundColor: index % 7 === 0 ? palette.yellow : palette.paper,
        }}
      />
    ))}
  </AbsoluteFill>
);

const ProgressMark = ({label, color = palette.yellow}: {label: string; color?: string}) => (
  <div style={{maxWidth: 840, color, fontFamily: font, fontSize: 34, lineHeight: 1.14, fontWeight: 780, letterSpacing: -0.8}}>{label}</div>
);

const PopBurst = ({x, y, start, color = palette.yellow}: {x: number; y: number; start: number; color?: string}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, start, 7);
  const fade = interpolate(frame, [start + 5, start + 16], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 2, height: 2, opacity: fade}}>
      {Array.from({length: 8}).map((_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: index % 2 === 0 ? 8 : 5,
            height: index % 2 === 0 ? 8 : 5,
            borderRadius: '50%',
            backgroundColor: color,
            transform: `rotate(${index * 45}deg) translateY(${-p * (42 + (index % 3) * 13)}px)`,
          }}
        />
      ))}
    </div>
  );
};

const CutFlash = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 2, 7], [0, 0.28, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const height = interpolate(frame, [0, 5, 8], [0, 1920, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity, pointerEvents: 'none'}}><div style={{width: '100%', height, backgroundColor: palette.yellow}} /></AbsoluteFill>;
};

const Message = ({children, mine, delay}: {children: ReactNode; mine?: boolean; delay: number}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, delay, 12);
  return (
    <div
      style={{
        maxWidth: 680,
        alignSelf: mine ? 'flex-end' : 'flex-start',
        padding: '25px 28px',
        borderRadius: mine ? '28px 28px 7px 28px' : '28px 28px 28px 7px',
        backgroundColor: mine ? palette.yellow : '#272622',
        color: mine ? palette.ink : palette.paper,
        fontFamily: font,
        fontWeight: 650,
        fontSize: 31,
        lineHeight: 1.23,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {children}
    </div>
  );
};

const ChatScene = () => {
  const frame = useCurrentFrame();
  const intro = ease(frame, 0, 18);
  return (
    <Scene duration={150}>
      <AbsoluteFill style={{backgroundColor: palette.ink, padding: '96px 68px 74px', boxSizing: 'border-box'}}>
        <Grain strength={0.13} />
        <div style={{height: 88, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: intro}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 50, height: 50, borderRadius: '50%', backgroundColor: palette.yellow}} />
            <span style={{fontFamily: font, color: palette.paper, fontWeight: 800, fontSize: 29}}>Lagos Dev Community</span>
          </div>
          <span style={{fontFamily: mono, color: palette.muted, fontSize: 22}}>2:17 PM</span>
        </div>
        <div style={{width: 100, height: 7, backgroundColor: palette.yellow, marginTop: 42, marginBottom: 52}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          <Message delay={14}>yo, I shipped the project. Now I have to write a README and I am tired.</Message>
          <Message delay={46} mine>I need it to look proper before other developers and recruiters see it.</Message>
          <Message delay={78}>
            Use <span style={{fontFamily: mono, color: palette.yellow}}>https://dokugen.samueltuoyo.com</span>. It reads the repo, then gives you a README worth showing.
          </Message>
        </div>
        <PopBurst x={842} y={840} start={78} />
        <div
          style={{
            position: 'absolute',
            right: 68,
            bottom: 82,
            width: 170,
            height: 170,
            borderRadius: '50%',
            border: `2px solid ${palette.yellow}`,
            opacity: 0.75,
            transform: `scale(${0.8 + ease(frame, 104, 20) * 0.2})`,
          }}
        />
      </AbsoluteFill>
    </Scene>
  );
};

const WebsiteScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 20);
  return (
    <Scene duration={330}>
      <AbsoluteFill style={{backgroundColor: palette.yellow, padding: '84px 0', boxSizing: 'border-box', alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 78, left: 68}}><ProgressMark label="Dokugen checks your code and turns it into README/documentation people can actually understand." /></div>
        <div style={{width: 740, height: 1508, marginTop: 154, opacity: p, transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * -2}deg)`, overflow: 'hidden'}}>
          <Video
            src={staticFile('iPhone-14-(iOS-16)-dokugen.samueltuoyo.com-lj3h-usr6j2xw6.webm')}
            muted
            objectFit="contain"
            style={{width: '100%', height: '100%', transform: 'scale(1.18)'}}
          />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const EmptyReadmeScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 18);
  return (
    <Scene duration={105}>
      <AbsoluteFill style={{backgroundColor: palette.ink, padding: '110px 70px', boxSizing: 'border-box'}}>
        <Grain strength={0.12} />
        <ProgressMark label="You probably have one of these. No README/documentation, no easy way for a developer or recruiter to get what you built." />
        <div style={{marginTop: 58, opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
          <div style={{height: 1080, backgroundColor: '#0d1117', overflow: 'hidden', boxShadow: '18px 20px 0 #000', border: '1px solid #30363d', display: 'flex', justifyContent: 'center'}}>
            <Img src={staticFile('evidence/github-blank-readme.png')} style={{height: '100%', width: '100%', objectFit: 'contain'}} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const TerminalRow = ({children, delay, color = palette.cream}: {children: ReactNode; delay: number; color?: string}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, delay, 8);
  return <div style={{fontFamily: mono, fontSize: 24, lineHeight: 1.55, color, opacity: p}}>{children}</div>;
};

const GenerateScene = () => {
  const frame = useCurrentFrame();
  const typed = 'dokugen generate'.slice(0, Math.floor(interpolate(frame, [18, 42], [0, 16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  return (
    <Scene duration={155}>
      <AbsoluteFill style={{backgroundColor: palette.charcoal, padding: '102px 66px', boxSizing: 'border-box'}}>
        <Grain strength={0.09} />
        <ProgressMark label="Run Dokugen, answer a few real questions, and get something clean enough to share." />
        <div style={{marginTop: 46, padding: '46px 42px', minHeight: 1100, boxSizing: 'border-box', border: `2px solid ${palette.line}`, backgroundColor: '#10100f', boxShadow: '18px 20px 0 #000'}}>
          <TerminalRow delay={0} color={palette.muted}>PS &gt; <span style={{color: palette.yellow}}>{typed}</span><span style={{opacity: frame % 14 < 7 ? 1 : 0}}>_</span></TerminalRow>
          <div style={{height: 30}} />
          <TerminalRow delay={30} color={palette.muted}>[2026-07-18] Current README backed up in memory</TerminalRow>
          <TerminalRow delay={36}><span style={{color: palette.green}}>✔</span> Found: 15 files in the project</TerminalRow>
          <TerminalRow delay={42}>Detected project type: <span style={{color: palette.yellow}}>Go</span></TerminalRow>
          <TerminalRow delay={50}>README.md exists for SaveIt. Overwrite?</TerminalRow>
          <TerminalRow delay={56} color={palette.green}>  Yes</TerminalRow>
          <TerminalRow delay={64} color={palette.muted}>Analyzing project files...</TerminalRow>
          <TerminalRow delay={72}>Include setup instructions in the README?</TerminalRow>
          <TerminalRow delay={78} color={palette.green}>  Yes</TerminalRow>
          <TerminalRow delay={84}>Include contribution guidelines in README?</TerminalRow>
          <TerminalRow delay={90} color={palette.green}>  Yes</TerminalRow>
          <TerminalRow delay={96}>Include API documentation in README?</TerminalRow>
          <TerminalRow delay={102} color={palette.green}>  Yes</TerminalRow>
          <TerminalRow delay={108}>Include system design diagrams in README?</TerminalRow>
          <TerminalRow delay={114} color={palette.green}>  Yes</TerminalRow>
          <TerminalRow delay={120}>LinkedIn username: <span style={{color: palette.green}}>Use saved details (@samueltuoyo)</span></TerminalRow>
          <TerminalRow delay={126}>X (Twitter) username: <span style={{color: palette.green}}>Use saved details (@TuoyoS26091)</span></TerminalRow>
          <div style={{height: 24}} />
          <div style={{height: 8, backgroundColor: '#34332e', overflow: 'hidden', opacity: ease(frame, 96, 8)}}>
            <div style={{width: `${interpolate(frame, [104, 132], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%`, height: '100%', backgroundColor: palette.yellow}} />
          </div>
          <TerminalRow delay={132} color={palette.green}>✔ README.md created successfully in 27s</TerminalRow>
        </div>
        <PopBurst x={896} y={1165} start={132} color={palette.green} />
      </AbsoluteFill>
    </Scene>
  );
};

const ProofScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 16);
  return (
    <Scene duration={840}>
      <AbsoluteFill
        style={{
          backgroundColor: palette.yellow,
          backgroundImage: 'radial-gradient(ellipse at 8% 90%, #050505 0%, #171612 29%, rgba(23,22,18,0.68) 43%, transparent 67%), linear-gradient(150deg, #ffd94c 0%, #f3c83b 57%, #151512 100%)',
          padding: '84px 0',
          boxSizing: 'border-box',
          alignItems: 'center',
        }}
      >
        <div style={{position: 'absolute', top: 78, left: 68, zIndex: 2}}>
          <ProgressMark color={palette.ink} label="Here is the kind of README/documentation Dokugen can create for your project." />
        </div>
        <div style={{width: 740, height: 1508, marginTop: 154, overflow: 'hidden', opacity: p, transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * -2}deg)`}}>
          <div style={{width: '100%', height: '100%', transform: 'scale(1.18)'}}>
            <Video
              src={staticFile('iPhone-14-(iOS-16)-github.com-8vm6uijmg9qvsp.webm')}
              muted
              playbackRate={0.75}
              style={{width: '100%', height: '100%', objectFit: 'contain'}}
            />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const AicScene = () => {
  const frame = useCurrentFrame();
  const command = 'dokugen aic';
  const typed = command.slice(0, Math.floor(interpolate(frame, [8, 28], [0, command.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  return (
    <Scene duration={150}>
      <AbsoluteFill style={{backgroundColor: palette.ink, padding: '102px 66px', boxSizing: 'border-box'}}>
        <Grain strength={0.1} />
        <ProgressMark label="And when you are ready to ship, it can help turn the real changes into a proper commit too." />
        <div style={{marginTop: 44, padding: '42px 36px', minHeight: 1120, boxSizing: 'border-box', border: `2px solid ${palette.line}`, backgroundColor: '#11110f', boxShadow: '18px 20px 0 #000'}}>
          <TerminalRow delay={0}>PS &gt; <span style={{color: palette.yellow}}>{typed}</span><span style={{opacity: frame % 14 < 7 ? 1 : 0}}>_</span></TerminalRow>
          <div style={{height: 28}} />
          <TerminalRow delay={34} color={palette.muted}>No staged changes detected. Staging all files...</TerminalRow>
          <TerminalRow delay={46}>Files being committed:</TerminalRow>
          <TerminalRow delay={54} color={palette.muted}>  cmd/server/main.go</TerminalRow>
          <TerminalRow delay={60} color={palette.muted}>  public/robots.txt</TerminalRow>
          <TerminalRow delay={66} color={palette.muted}>  public/sitemap.xml</TerminalRow>
          <TerminalRow delay={72} color={palette.muted}>  templates/index.html</TerminalRow>
          <div style={{height: 14}} />
          <TerminalRow delay={82} color={palette.green}>✔ Commit message generated successfully in 4s</TerminalRow>
          <div style={{marginTop: 26, padding: 22, backgroundColor: '#24231e', fontFamily: mono, fontSize: 21, lineHeight: 1.45, color: palette.paper, opacity: ease(frame, 96, 10)}}>
            feat(server): add sitemap, robots.txt,<br />and public assets while restricting index.html
          </div>
          <TerminalRow delay={112}>What would you like to do?</TerminalRow>
          <TerminalRow delay={118} color={palette.yellow}>  Accept and Commit</TerminalRow>
          <TerminalRow delay={126} color={palette.muted}>[main 3a243ce] feat(server): add sitemap, robots.txt...</TerminalRow>
          <TerminalRow delay={134} color={palette.green}>Commit successful</TerminalRow>
        </div>
        <PopBurst x={884} y={1140} start={134} color={palette.green} />
      </AbsoluteFill>
    </Scene>
  );
};

const FinalScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 20);
  return (
    <Scene duration={90}>
      <AbsoluteFill style={{backgroundColor: palette.yellow, padding: '108px 68px', boxSizing: 'border-box', justifyContent: 'space-between'}}>
        <div style={{opacity: p, transform: `translateY(${(1 - p) * 42}px)`}}>
          <Img src={staticFile('smile_logo.svg')} style={{width: 132, height: 132}} />
          <div style={{fontFamily: font, color: palette.ink, fontSize: 100, fontWeight: 900, letterSpacing: -5, marginTop: 30}}>Dokugen</div>
          <div style={{fontFamily: font, color: palette.ink, fontSize: 52, lineHeight: 1.05, letterSpacing: -2.1, fontWeight: 780, marginTop: 46}}>The README/documentation part people skip,<br />handled properly.</div>
        </div>
        <div style={{fontFamily: mono, color: palette.ink, fontSize: 24, fontWeight: 700, opacity: p}}>Clearer projects. Happier contributors.</div>
      </AbsoluteFill>
    </Scene>
  );
};

export const DokugenVertical = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: palette.ink}}>
      <Audio
        src={staticFile('dokugen-score.wav')}
        volume={(frame) => interpolate(frame, [0, fps, 27 * fps, 30 * fps], [0, 0.2, 0.2, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      <Sequence from={0} durationInFrames={150}><ChatScene /></Sequence>
      <Sequence from={135} durationInFrames={330}><WebsiteScene /></Sequence>
      <Sequence from={450} durationInFrames={105}><EmptyReadmeScene /></Sequence>
      <Sequence from={540} durationInFrames={155}><GenerateScene /></Sequence>
      <Sequence from={680} durationInFrames={840}><ProofScene /></Sequence>
      <Sequence from={1505} durationInFrames={150}><AicScene /></Sequence>
      <Sequence from={1640} durationInFrames={90}><FinalScene /></Sequence>
      {[135, 450, 540, 680, 1505, 1640].map((from) => (
        <Sequence key={from} from={from} durationInFrames={8} layout="none"><CutFlash /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
