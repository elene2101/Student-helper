export interface MenuItem {
  text: string;
  isExpanded: boolean;
  route: string;
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
    route: 'activites',
    children: [
      { text: 'კლასები', route: 'classes' },
      { text: 'გამოცდები', route: 'bla' },
      { text: 'დავალებები', route: 'assignments' },
    ],
  },
];
