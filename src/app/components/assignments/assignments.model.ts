export interface Assignment {
  id?: string;
  subjectId: string;
  description?: string;
  deadline: Date;
  deadlineTime: Date;
  completed: boolean;
  userId?: string;
  type?:
    | 'დავალება'
    | 'შეხსენება'
    | 'ტექსტის გადახედვა'
    | 'ესე'
    | 'ჯგუფური პროექტი';
}

export const AssignmentsType = [
  'დავალება',
  'შეხსენება',
  'ტექსტის გადახედვა',
  'ესე',
  'ჯგუფური პროექტი',
];

export const QuillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
  ],
};
