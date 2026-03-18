import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  Clock as Schedule, 
  ArrowRight as ArrowForward, 
  Home as HomeIcon, 
  Calendar as CalendarMonth, 
  Heart as Favorite, 
  User as Person,
  ArrowLeft as ArrowBack,
  Bookmark,
  Share2 as Share,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  BookOpen as AutoStories
} from 'lucide-react';
import { HistoricalEvent, View } from './types';
import { getEventsForDate } from './services/geminiService';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [favorites, setFavorites] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEventsForDate(currentDate.getMonth(), currentDate.getDate());
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (event: HistoricalEvent) => {
    setFavorites(prev => {
      const isFav = prev.find(f => f.id === event.id);
      if (isFav) return prev.filter(f => f.id !== event.id);
      return [...prev, event];
    });
  };

  const navigateToDetail = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView 
          events={events} 
          loading={loading} 
          onSelect={navigateToDetail} 
          date={currentDate}
        />;
      case 'detail':
        return selectedEvent ? (
          <DetailView 
            event={selectedEvent} 
            onBack={() => setCurrentView('home')} 
            isFavorite={!!favorites.find(f => f.id === selectedEvent.id)}
            onToggleFavorite={() => toggleFavorite(selectedEvent)}
          />
        ) : null;
      case 'favorites':
        return <FavoritesView 
          favorites={favorites} 
          onSelect={navigateToDetail} 
        />;
      case 'calendar':
        return <CalendarView 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          events={events}
          onSelect={navigateToDetail}
        />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView + (selectedEvent?.id || '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-primary/20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg px-4 pb-8 pt-3 max-w-2xl mx-auto w-full">
        <div className="flex justify-around items-center">
          <NavButton 
            active={currentView === 'home'} 
            onClick={() => setCurrentView('home')} 
            icon={<HomeIcon size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')} 
            icon={<CalendarMonth size={24} />} 
            label="Calendar" 
          />
          <NavButton 
            active={currentView === 'favorites'} 
            onClick={() => setCurrentView('favorites')} 
            icon={<Favorite size={24} />} 
            label="Favorites" 
          />
          <NavButton 
            active={currentView === 'profile'} 
            onClick={() => setCurrentView('profile')} 
            icon={<Person size={24} />} 
            label="Profile" 
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-slate-400 hover:text-primary/70'}`}
    >
      <div className={active ? 'fill-primary' : ''}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- Views ---

function HomeView({ events, loading, onSelect, date }: { events: HistoricalEvent[], loading: boolean, onSelect: (e: HistoricalEvent) => void, date: Date }) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}${getOrdinal(date.getDate())}`;

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-24">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <div className="flex flex-col">
          <span className="text-primary font-semibold text-xs uppercase tracking-widest">{dateStr}</span>
          <h1 className="text-2xl font-bold tracking-tight">Daily Discovery</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bell size={20} />
        </button>
      </header>

      <div className="px-4 pt-6 pb-4">
        <h2 className="text-3xl font-bold mb-6">What Happened Today?</h2>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <input 
            className="block w-full pl-10 pr-4 py-3 bg-primary/5 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            placeholder="Search historical events..."
            type="text"
          />
        </div>
      </div>

      <div className="px-4 space-y-6 mt-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-primary/5 border border-primary/10 h-80"></div>
          ))
        ) : (
          events.map(event => (
            <motion.div 
              key={event.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelect(event)}
              className="group rounded-xl overflow-hidden bg-white dark:bg-primary/5 border border-primary/10 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <div className="relative h-56 w-full bg-slate-200 dark:bg-slate-800">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-2 py-1 bg-primary text-background-dark text-[10px] font-bold rounded uppercase tracking-wider">{event.year}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                    <Schedule size={14} /> {event.readTime}
                  </span>
                  <button className="px-5 py-2 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                    Learn More <ArrowForward size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailView({ event, onBack, isFavorite, onToggleFavorite }: { event: HistoricalEvent, onBack: () => void, isFavorite: boolean, onToggleFavorite: () => void }) {
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-24">
      <header className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <ArrowBack size={24} />
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Historical Fact</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onToggleFavorite}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isFavorite ? 'bg-primary text-background-dark' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
          >
            <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
            <Share size={20} />
          </button>
        </div>
      </header>

      <main className="pb-12">
        <div className="relative w-full aspect-video overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-transparent to-transparent"></div>
        </div>

        <article className="px-6 py-8">
          <div className="flex flex-col gap-2 mb-6">
            <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold text-primary w-fit uppercase tracking-widest">
              {event.category}
            </span>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">{event.title}</h1>
            <div className="flex items-center gap-2 text-primary">
              <Schedule size={16} />
              <p className="text-sm font-semibold uppercase tracking-wider">{event.date} {event.year}</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
            {event.fullStory.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {event.didYouKnow && (
            <div className="my-10 p-6 rounded-xl bg-primary/10 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary p-1 rounded-full text-background-dark">
                  <Lightbulb size={20} />
                </div>
                <h3 className="text-xl font-bold text-primary">Did You Know?</h3>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                {event.didYouKnow}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={onToggleFavorite}
              className={`flex-1 h-14 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${isFavorite ? 'bg-slate-800 text-white' : 'bg-primary text-background-dark shadow-primary/20 hover:scale-[1.02]'}`}
            >
              <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? 'Saved to Collection' : 'Save to Collection'}
            </button>
            <button className="flex-1 h-14 border-2 border-primary/30 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
              <Share size={20} />
              Share Fact
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}

function FavoritesView({ favorites, onSelect }: { favorites: HistoricalEvent[], onSelect: (e: HistoricalEvent) => void }) {
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-24">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">My Collection</h1>
          <button className="text-primary font-bold text-base px-2 py-1 hover:bg-primary/10 rounded-lg transition-colors">
            Edit
          </button>
        </div>
        <div className="mb-4">
          <div className="flex items-center h-12 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-xl px-4 border border-slate-300 dark:border-slate-700 focus-within:border-primary transition-colors">
            <Search className="text-slate-500 dark:text-slate-400 mr-2" size={20} />
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-normal py-0" 
              placeholder="Search saved events" 
              type="text"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-2">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Bookmark size={48} className="mb-4 opacity-20" />
            <p>Your collection is empty.</p>
            <p className="text-sm">Save events to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map(event => (
              <motion.div 
                key={event.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelect(event)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer"
              >
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-bold leading-tight line-clamp-2">{event.title}</p>
                </div>
                <div className="absolute top-2 right-2 h-8 w-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-primary">
                  <Favorite size={16} fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CalendarView({ currentDate, onDateChange, events, onSelect }: { currentDate: Date, onDateChange: (d: Date) => void, events: HistoricalEvent[], onSelect: (e: HistoricalEvent) => void }) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    onDateChange(newDate);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-24">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">History Calendar</h1>
        </div>
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
          <Share size={20} />
        </button>
      </header>

      <main className="flex-1">
        <section className="p-4 flex flex-col items-center">
          <div className="w-full max-w-md bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-primary/20 text-slate-700 dark:text-slate-300">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-sm font-bold uppercase tracking-widest">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={() => changeMonth(1)} className="size-10 flex items-center justify-center rounded-full hover:bg-primary/20 text-slate-700 dark:text-slate-300">
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 py-2">{d}</div>
              ))}
              {padding.map(p => <div key={`p-${p}`} className="h-10"></div>)}
              {days.map(d => {
                const isSelected = d === currentDate.getDate();
                return (
                  <button 
                    key={d}
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(d);
                      onDateChange(newDate);
                    }}
                    className={`h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isSelected ? 'bg-primary text-background-dark font-bold shadow-md shadow-primary/20' : 'hover:bg-primary/10 text-slate-600 dark:text-slate-400'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-2">
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold">Events on {monthNames[currentDate.getMonth()]} {currentDate.getDate()}</h3>
            <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-full uppercase tracking-tighter">{events.length} HISTORICAL EVENTS</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map(event => (
              <div 
                key={event.id} 
                onClick={() => onSelect(event)}
                className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <div className="size-16 rounded-lg bg-center bg-cover border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold group-hover:text-primary transition-colors">{event.title}</h4>
                    <span className="text-sm font-bold text-primary">{event.year}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full pb-24 p-6">
      <div className="flex flex-col items-center mt-10">
        <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border-2 border-primary">
          <Person size={48} />
        </div>
        <h2 className="text-2xl font-bold">History Explorer</h2>
        <p className="text-slate-500 text-sm">Member since March 2026</p>
      </div>

      <div className="mt-10 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">Settings</h3>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/10">
          <span className="font-medium">Notifications</span>
          <div className="w-10 h-5 bg-primary rounded-full relative">
            <div className="absolute right-1 top-1 size-3 bg-background-dark rounded-full"></div>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/10">
          <span className="font-medium">Dark Mode</span>
          <div className="w-10 h-5 bg-primary rounded-full relative">
            <div className="absolute right-1 top-1 size-3 bg-background-dark rounded-full"></div>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/10">
          <span className="font-medium">Language</span>
          <span className="text-slate-500 text-sm">English</span>
        </button>
      </div>

      <div className="mt-10 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">Account</h3>
        <button className="w-full text-left p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/10 font-medium text-red-500">
          Log Out
        </button>
      </div>
    </div>
  );
}

// --- Helpers ---

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
