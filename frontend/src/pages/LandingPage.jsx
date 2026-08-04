import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">Crowd-sourced infrastructure intelligence</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">VisionRoute</h1>
          <p className="mt-4 text-lg text-brand-50/95">
            AI-powered road damage detection for citizens and municipal authorities. Upload road imagery, run YOLOv8 inference in
            seconds, and coordinate repairs on a live map.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/upload" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50">
              Camera upload
            </Link>
            <Link to="/dashboard" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10">
              Authority dashboard
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'YOLOv8 detection',
            body: 'Automatic pothole and crack detection with bounding boxes and confidence scores.',
          },
          {
            title: 'Geo-tagged reports',
            body: 'Browser GPS or manual coordinates attach every sighting to the map.',
          },
          {
            title: 'Disaster mode',
            body: 'Filter critical incidents and visualize emergency routes during outages.',
          },
        ].map((f) => (
          <div key={f.title} className="card">
            <h2 className="font-semibold text-slate-900">{f.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="card mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Citizen reporting</h2>
          <p className="text-sm text-slate-600">No dashcam? Submit a photo and optional description — detection runs automatically.</p>
        </div>
        <Link to="/report" className="btn-primary">
          Report an issue
        </Link>
      </section>
    </div>
  );
}
