import type {CSSProperties, ReactNode} from 'react';
import {Audio} from '@remotion/media';
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

const sceneOpacity = (frame: number, duration: number) =>
  Math.min(
    interpolate(frame, [0, 12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(frame, [duration - 12, duration], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

const Scene = ({children, duration}: {children: ReactNode; duration: number}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: sceneOpacity(frame, duration)}}>{children}</AbsoluteFill>;
};

const Grain = ({strength = 0.18}: {strength?: number}) => (
  <AbsoluteFill pointerEvents="none" style={{overflow: 'hidden', opacity: strength}}>
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

const ProgressMark = ({label}: {label: string}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, color: palette.yellow}}>
    <span style={{display: 'block', width: 44, height: 6, backgroundColor: palette.yellow}} />
    <span style={{fontFamily: mono, fontSize: 22, fontWeight: 700, letterSpacing: 1.2}}>{label}</span>
  </div>
);

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
            <span style={{fontFamily: font, color: palette.paper, fontWeight: 800, fontSize: 31}}>dev chat</span>
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

const Phone = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <div
    style={{
      width: 786,
      height: 1450,
      borderRadius: 62,
      border: `14px solid ${palette.charcoal}`,
      backgroundColor: palette.charcoal,
      boxShadow: '0 32px 0 #000, 0 45px 100px rgba(0,0,0,0.55)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const SitePage = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [26, 156], [0, 830], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  return (
    <div style={{height: '100%', backgroundColor: '#fafafa', overflow: 'hidden', color: '#18181b'}}>
      <div style={{height: 64, backgroundColor: '#18181b', color: palette.paper, display: 'flex', alignItems: 'center', padding: '0 22px', fontFamily: mono, fontSize: 16}}>
        <span style={{color: palette.yellow}}>https://</span>dokugen.samueltuoyo.com
      </div>
      <div style={{transform: `translateY(${-scroll}px)`, padding: '58px 42px 120px'}}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 28}}>
          <Img src={staticFile('smile_logo.svg')} style={{width: 98, height: 98}} />
        </div>
        <h1 style={{fontFamily: font, fontSize: 60, lineHeight: 1.02, letterSpacing: -2.4, textAlign: 'center', margin: 0, fontWeight: 850}}>
          The easiest way to generate
          <br />
          <span style={{color: '#7c3aed'}}>beautiful</span> and <span style={{color: '#b58a00'}}>accurate</span> READMEs
        </h1>
        <p style={{fontFamily: font, fontSize: 24, lineHeight: 1.45, color: '#71717a', textAlign: 'center', margin: '32px 5px 48px'}}>
          Dokugen scans your codebase and creates a detailed README in seconds.
        </p>
        <div style={{border: '2px solid #e4e4e7', borderRadius: 22, backgroundColor: '#fff', padding: '24px 26px', color: '#a1a1aa', fontFamily: font, fontSize: 23}}>
          Search documentation...
        </div>
        <div style={{marginTop: 128, borderTop: '2px solid #e4e4e7', paddingTop: 56}}>
          <h2 style={{fontFamily: font, fontSize: 43, margin: 0, letterSpacing: -1.5}}>Getting started</h2>
          <div style={{marginTop: 30, padding: 28, backgroundColor: '#fff', border: '2px solid #e4e4e7', borderRadius: 24}}>
            <div style={{fontFamily: font, fontSize: 28, fontWeight: 800}}>Install with Node.js</div>
            <div style={{marginTop: 22, padding: 18, backgroundColor: '#18181b', color: palette.yellow, borderRadius: 12, fontFamily: mono, fontSize: 20}}>
              npm install -g dokugen
            </div>
          </div>
          <div style={{marginTop: 28, padding: 28, backgroundColor: '#fff', border: '2px solid #e4e4e7', borderRadius: 24}}>
            <div style={{fontFamily: font, fontSize: 28, fontWeight: 800}}>Generate from the repo</div>
            <div style={{marginTop: 12, fontFamily: font, fontSize: 21, lineHeight: 1.4, color: '#71717a'}}>Run a command. Answer what matters. Get the document.</div>
          </div>
        </div>
        <div style={{marginTop: 112}}>
          <div style={{borderRadius: 26, overflow: 'hidden', border: '2px solid #e4e4e7', backgroundColor: '#18181b', padding: 14}}>
            <Img src={staticFile('smile_logo.svg')} style={{width: 56, height: 56, margin: 22}} />
            <div style={{color: palette.paper, padding: '0 28px 56px', fontFamily: font, fontSize: 38, fontWeight: 800, lineHeight: 1.05}}>Dokugen in action.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WebsiteScene = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 20);
  return (
    <Scene duration={195}>
      <AbsoluteFill style={{backgroundColor: palette.yellow, padding: '84px 0', boxSizing: 'border-box', alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 78, left: 68}}><ProgressMark label="01 / OPEN" /></div>
        <div style={{position: 'absolute', top: 130, right: 70, width: 270, height: 10, backgroundColor: palette.ink}} />
        <Phone style={{opacity: p, transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * -2}deg)`}}>
          <SitePage />
        </Phone>
        <div style={{position: 'absolute', bottom: 76, left: 68, right: 68, color: palette.ink, fontFamily: font, fontWeight: 850, letterSpacing: -1.8, fontSize: 51, lineHeight: 1.02}}>
          See what it can make.
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
        <ProgressMark label="02 / THE BLANK" />
        <div style={{marginTop: 86, opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
          <div style={{backgroundColor: '#f5f1e3', minHeight: 1050, padding: '66px 58px', boxSizing: 'border-box', boxShadow: '18px 20px 0 #2b2a26'}}>
            <div style={{fontFamily: mono, color: '#6b665d', fontSize: 24, borderBottom: '2px solid #d1cbba', paddingBottom: 30}}>README.md</div>
            <div style={{fontFamily: font, color: '#211f1b', fontSize: 60, fontWeight: 850, letterSpacing: -2, marginTop: 72, lineHeight: 1.02}}>A blank README says nothing about the work.</div>
            <div style={{marginTop: 94, height: 2, backgroundColor: '#d1cbba'}} />
            <div style={{fontFamily: mono, fontSize: 26, color: '#8a8477', marginTop: 38}}>0 bytes</div>
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
        <ProgressMark label="03 / GENERATE" />
        <div style={{marginTop: 74, padding: '46px 42px', minHeight: 1100, boxSizing: 'border-box', border: `2px solid ${palette.line}`, backgroundColor: '#10100f', boxShadow: '18px 20px 0 #000'}}>
          <TerminalRow delay={0} color={palette.muted}>PS &gt; <span style={{color: palette.yellow}}>{typed}</span><span style={{opacity: frame % 14 < 7 ? 1 : 0}}>_</span></TerminalRow>
          <div style={{height: 30}} />
          <TerminalRow delay={52} color={palette.muted}>Current README backed up in memory</TerminalRow>
          <TerminalRow delay={65}><span style={{color: palette.green}}>OK</span> Found: 15 files in the project</TerminalRow>
          <TerminalRow delay={78}>Detected project type: <span style={{color: palette.yellow}}>Go</span></TerminalRow>
          <div style={{height: 20}} />
          <TerminalRow delay={90}>README.md exists. Overwrite? <span style={{color: palette.green}}>Yes</span></TerminalRow>
          <TerminalRow delay={101}>Setup instructions? <span style={{color: palette.green}}>Yes</span></TerminalRow>
          <TerminalRow delay={112}>System design diagrams? <span style={{color: palette.green}}>Yes</span></TerminalRow>
          <div style={{height: 36}} />
          <div style={{height: 8, backgroundColor: '#34332e', overflow: 'hidden', opacity: ease(frame, 96, 8)}}>
            <div style={{width: `${interpolate(frame, [104, 142], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%`, height: '100%', backgroundColor: palette.yellow}} />
          </div>
          <TerminalRow delay={142} color={palette.green}>README.md created successfully in 39s</TerminalRow>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const MarkdownPreview = ({architecture}: {architecture: boolean}) => (
  <div style={{height: 1190, padding: '0 0 42px', backgroundColor: '#1d1f20', color: '#eadfbd', overflow: 'hidden'}}>
    <div style={{height: 76, display: 'flex', alignItems: 'center', padding: '0 30px', borderBottom: '1px solid #3c3d3d', fontFamily: mono, fontSize: 22}}>
      <span style={{color: palette.yellow}}>README.md</span><span style={{marginLeft: 16, color: '#8c8b84'}}>preview</span>
    </div>
    <div style={{padding: '54px 46px'}}>
      {architecture ? (
        <>
          <h2 style={{fontFamily: font, fontSize: 48, margin: 0, letterSpacing: -1.4}}>System Architecture</h2>
          <div style={{height: 2, backgroundColor: '#464640', marginTop: 20}} />
          <p style={{fontFamily: font, fontSize: 25, lineHeight: 1.45, color: '#d8cfb3', margin: '30px 0 48px'}}>A clear map of how the moving pieces work together.</p>
          <div style={{height: 520, position: 'relative', fontFamily: font, fontSize: 20, color: palette.paper}}>
            <div style={{position: 'absolute', left: 8, top: 190, width: 172, padding: '18px 10px', textAlign: 'center', border: '2px solid #2c9dca', backgroundColor: '#1c2c36'}}>Web client</div>
            <div style={{position: 'absolute', left: 260, top: 190, width: 190, padding: '18px 10px', textAlign: 'center', border: '2px solid #b078ee', backgroundColor: '#2e1d4b'}}>Go API</div>
            <div style={{position: 'absolute', right: 8, top: 65, width: 150, padding: '18px 10px', textAlign: 'center', border: '2px solid #e45959', backgroundColor: '#441a1c'}}>Cache</div>
            <div style={{position: 'absolute', right: 8, bottom: 65, width: 150, padding: '18px 10px', textAlign: 'center', border: '2px solid #e2b53a', backgroundColor: '#483d19'}}>yt-dlp</div>
            <div style={{position: 'absolute', left: 184, top: 223, width: 74, height: 2, backgroundColor: '#d9cfb1'}} />
            <div style={{position: 'absolute', left: 452, top: 202, width: 120, height: 2, backgroundColor: '#d9cfb1', transform: 'rotate(-24deg)', transformOrigin: 'left center'}} />
            <div style={{position: 'absolute', left: 452, top: 239, width: 120, height: 2, backgroundColor: '#d9cfb1', transform: 'rotate(24deg)', transformOrigin: 'left center'}} />
          </div>
        </>
      ) : (
        <>
          <h2 style={{fontFamily: font, fontSize: 52, margin: 0, letterSpacing: -1.5}}>Features</h2>
          <div style={{height: 2, backgroundColor: '#464640', marginTop: 20}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 36, marginTop: 50, fontFamily: font, fontSize: 29, lineHeight: 1.32}}>
            <div><span style={{color: palette.yellow}}>01</span> <strong>Clear setup.</strong> Installation and usage that a developer can follow.</div>
            <div><span style={{color: palette.yellow}}>02</span> <strong>Useful diagrams.</strong> A visual map for the people reading the code next.</div>
            <div><span style={{color: palette.yellow}}>03</span> <strong>The real stack.</strong> Technologies and API details from the actual project.</div>
          </div>
          <div style={{marginTop: 90, padding: 28, border: '1px solid #474841', backgroundColor: '#151615', fontFamily: mono, color: '#b5d7e8', fontSize: 22, lineHeight: 1.5}}>
            ## Installation<br />
            npm install<br />
            npm run dev
          </div>
        </>
      )}
    </div>
  </div>
);

const ProofScene = () => {
  const frame = useCurrentFrame();
  const first = ease(frame, 0, 18);
  const swap = ease(frame, 70, 18);
  const pan = interpolate(frame, [22, 130], [0, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Scene duration={150}>
      <AbsoluteFill style={{backgroundColor: palette.paper, padding: '96px 64px', boxSizing: 'border-box'}}>
        <div style={{color: palette.ink}}><ProgressMark label="04 / PROOF" /></div>
        <div style={{marginTop: 54, height: 1190, position: 'relative', overflow: 'hidden', border: '12px solid #1d1f20', boxShadow: '18px 20px 0 #bbb5a5'}}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `translateY(${-pan}px)`}}><MarkdownPreview architecture={false} /></div>
          <div style={{position: 'absolute', inset: 0, opacity: swap, transform: `translateY(${(1 - swap) * 65}px)`}}><MarkdownPreview architecture /></div>
        </div>
        <div style={{position: 'absolute', left: 64, right: 64, bottom: 84, color: palette.ink, fontFamily: font, fontSize: 49, fontWeight: 850, letterSpacing: -1.6, lineHeight: 1.04, opacity: first}}>
          It does not just make a file. It gives the project a story.
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
        <ProgressMark label="05 / COMMIT" />
        <div style={{marginTop: 72, padding: '42px 36px', minHeight: 1120, boxSizing: 'border-box', border: `2px solid ${palette.line}`, backgroundColor: '#11110f', boxShadow: '18px 20px 0 #000'}}>
          <TerminalRow delay={0}>PS &gt; <span style={{color: palette.yellow}}>{typed}</span><span style={{opacity: frame % 14 < 7 ? 1 : 0}}>_</span></TerminalRow>
          <div style={{height: 28}} />
          <TerminalRow delay={34} color={palette.muted}>No staged changes detected. Staging all files...</TerminalRow>
          <TerminalRow delay={48}>Files being committed:</TerminalRow>
          <TerminalRow delay={58} color={palette.muted}>  cmd/server/main.go</TerminalRow>
          <TerminalRow delay={66} color={palette.muted}>  public/robots.txt</TerminalRow>
          <TerminalRow delay={74} color={palette.muted}>  public/sitemap.xml</TerminalRow>
          <div style={{height: 20}} />
          <TerminalRow delay={86} color={palette.green}>OK Commit message generated successfully in 4s</TerminalRow>
          <div style={{marginTop: 26, padding: 22, borderLeft: `6px solid ${palette.yellow}`, backgroundColor: '#24231e', fontFamily: mono, fontSize: 21, lineHeight: 1.45, color: palette.paper, opacity: ease(frame, 96, 10)}}>
            feat(server): add sitemap, robots.txt, and public assets
          </div>
          <TerminalRow delay={115}>What would you like to do? <span style={{color: palette.yellow}}>Accept and Commit</span></TerminalRow>
          <TerminalRow delay={130} color={palette.green}>Commit successful</TerminalRow>
        </div>
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
        <div style={{width: 110, height: 12, backgroundColor: palette.ink, opacity: p}} />
        <div style={{opacity: p, transform: `translateY(${(1 - p) * 42}px)`}}>
          <Img src={staticFile('smile_logo.svg')} style={{width: 132, height: 132}} />
          <div style={{fontFamily: font, color: palette.ink, fontSize: 100, fontWeight: 900, letterSpacing: -5, marginTop: 30}}>Dokugen</div>
          <div style={{fontFamily: font, color: palette.ink, fontSize: 57, lineHeight: 1.04, letterSpacing: -2.3, fontWeight: 780, marginTop: 46}}>Build the project.<br />Show the work.</div>
        </div>
        <div style={{fontFamily: mono, color: palette.ink, fontSize: 24, fontWeight: 700, borderTop: '3px solid #151512', paddingTop: 26, opacity: p}}>https://dokugen.samueltuoyo.com</div>
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
      <Sequence from={135} durationInFrames={195}><WebsiteScene /></Sequence>
      <Sequence from={315} durationInFrames={105}><EmptyReadmeScene /></Sequence>
      <Sequence from={405} durationInFrames={155}><GenerateScene /></Sequence>
      <Sequence from={540} durationInFrames={150}><ProofScene /></Sequence>
      <Sequence from={675} durationInFrames={150}><AicScene /></Sequence>
      <Sequence from={810} durationInFrames={90}><FinalScene /></Sequence>
    </AbsoluteFill>
  );
};
