import { useEffect } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Overview } from './components/Overview/Overview';
import { RoadmapSection } from './components/Roadmap/RoadmapSection';
import { LearningPaths } from './components/LearningPaths/LearningPaths';
import { ProgressTracker } from './components/Progress/Progress';
import { Projects } from './components/Projects/Projects';
import { About } from './components/About/About';
import { Footer } from './components/Footer/Footer';
import { TopicPanel } from './components/TopicPanel/TopicPanel';
import { SearchOverlay } from './components/Search/SearchOverlay';
import { VideoModal } from './components/ResourceLibrary/VideoModal';
import { ResourceLibrary } from './components/ResourceLibrary/ResourceLibrary';
import { NotFound } from './pages/NotFound';
import { PrintView } from './components/PrintView';

function Shell() {
  const { route, goResources } = useStore();
  useEffect(() => {
    document.title = route.name === 'resources' ? 'Resource library · Embedded Systems Engineering Roadmap · Naresh Yadav'
      : route.name === 'notfound' ? 'Page not found · Embedded Roadmap' : 'Embedded Systems Engineering Roadmap · Naresh Yadav';
  }, [route]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-float">Skip to content</a>
      <div className="print:hidden">
        <Header />
        <main id="main">
          {route.name === 'home' && (
            <>
              <Hero />
              <Overview />
              <RoadmapSection />
              <LearningPaths />
              <section id="resources" className="scroll-mt-16 border-b border-line bg-white py-14 sm:py-16" aria-labelledby="res-title">
                <div className="container-x flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="max-w-2xl">
                    <p className="eyebrow">Resources</p>
                    <h2 id="res-title" className="h2 mt-2">A full library of learning resources</h2>
                    <p className="mt-2 text-[15px] text-muted">Browse every YouTube video, playlist, channel, course, book and document from the original roadmap, filter by type and topic, and bookmark what you like.</p>
                  </div>
                  <button className="btn-primary" onClick={() => goResources()}>Open resource library</button>
                </div>
              </section>
              <Projects />
              <ProgressTracker />
              <About />
            </>
          )}
          {route.name === 'resources' && <ResourceLibrary />}
          {route.name === 'notfound' && <NotFound hash={route.hash} />}
        </main>
        <Footer />
        <TopicPanel />
        <SearchOverlay />
        <VideoModal />
      </div>
      <PrintView />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
