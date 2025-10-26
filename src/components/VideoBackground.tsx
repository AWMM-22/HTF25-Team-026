export default function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/bgvideo.mp4"
      />
    </div>
  );
}
