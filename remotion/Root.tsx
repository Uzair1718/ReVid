import { Composition } from 'remotion';
import { ShortsComposition, shortsSchema } from './ShortsComposition';
import './style.css'; // We will create this or use tailwind

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ShortsComposition"
                component={ShortsComposition}
                durationInFrames={60 * 30} // 60 seconds at 30fps
                fps={30}
                width={1080}
                height={1920}
                schema={shortsSchema}
                defaultProps={{
                    videoSrc: "",
                    captions: [],
                    title: "My Viral Short",
                    clipStart: 0,
                    clipEnd: 60,
                    captionStyle: 'pop',
                    captionColor: '#ffffff'
                }}
            />
        </>
    );
};
