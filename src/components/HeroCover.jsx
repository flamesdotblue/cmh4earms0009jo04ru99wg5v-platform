import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <div className="absolute inset-0">
      <Spline scene="https://prod.spline.design/7m4PRZ7kg6K1jPfF/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          LevelUp Life
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl mx-auto">
          Gamified productivity powered by AI. Focus deeply, complete meaningful tasks, and evolve your avatar as you grow.
        </p>
      </div>
    </div>
  );
}
