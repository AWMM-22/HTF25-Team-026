import clsx from 'clsx';

type Props = {
  src?: string;
  className?: string;
};

export default function SectionVideoBackground({ src = '/bgvideo.mp4', className }: Props) {
  return (
    <div className={clsx('absolute inset-0 pointer-events-none', className)}>
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src={src}
      />
    </div>
  );
}
