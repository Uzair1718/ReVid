import { Composition } from 'remotion';
import { ShortsComposition, shortsSchema } from './ShortsComposition';
import './style.css'; // We will create this or use tailwind

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ShortsComposition"
                component={ShortsComposition}
                durationInFrames={30 * 60} // Default 60 seconds at 30fps
                fps={30}
                width={1080}
                height={1920}
                schema={shortsSchema}
                defaultProps={{
                    videoSrc: "",
                    captions: [],
                    title: "My Viral Short"
                }}
            />
        </>
    );
};
