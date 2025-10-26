const quotes = [
  "Cleanliness is next to godliness",
  "Be the change you wish to see",
  "Small actions, big impact",
  "Every report makes a difference",
  "Together for a cleaner tomorrow",
  "Your voice, our mission",
];

const ScrollingQuotes = () => {
  return (
    <div className="w-full py-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 overflow-hidden">
      <style>{`
        @keyframes scroll-quotes {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-animation {
          animation: scroll-quotes 30s linear infinite;
        }
      `}</style>
      <div className="flex scroll-animation">
        {[...quotes, ...quotes].map((quote, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-8 text-2xl font-semibold text-primary whitespace-nowrap"
          >
            {quote}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingQuotes;
