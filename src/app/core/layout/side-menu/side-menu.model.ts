export interface MenuItem {
  text: string;
  isExpanded: boolean;
  route?: string;
  children: {
    text: string;
    route: string;
    isActive?: boolean;
  }[];
}

export const MenuItems: MenuItem[] = [
  {
    text: 'დეშბორდები',
    isExpanded: false,
    route: 'dashboard',
    children: [],
  },
  { text: 'კალენდარი', isExpanded: false, route: 'calendar', children: [] },
  {
    text: 'აქტივოვები',
    isExpanded: false,
    children: [
      { text: 'კლასები', route: 'classes' },
      { text: 'გამოცდები', route: 'exams' },
      { text: 'დავალებები', route: 'assignments' },
    ],
  },
];
