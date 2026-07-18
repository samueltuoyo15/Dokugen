import {Composition} from 'remotion';
import {DokugenLaunch} from './DokugenLaunch';
import {DokugenVertical} from './DokugenVertical';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="DokugenLaunch"
        component={DokugenLaunch}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DokugenMobileFilm"
        component={DokugenVertical}
        durationInFrames={1730}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
