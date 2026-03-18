export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;
  year: string;
  description: string;
  fullStory: string;
  imageUrl: string;
  readTime: string;
  category: string;
  didYouKnow?: string;
}

export type View = 'home' | 'detail' | 'favorites' | 'calendar' | 'profile';
