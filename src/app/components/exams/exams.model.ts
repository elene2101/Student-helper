export interface Exam {
  id?: string;
  name: string;
  subject: { name: string; id: string };
  type: ExamType;
  location: LocationType;
  roomNumber?: string | null;
  date: Date;
  time: Date;
  duration: number;
  userId?: string;
  description?: string;
}

export enum ExamType {
  Exam = 'Exam',
  Quiz = 'Quiz',
}

export enum LocationType {
  Campus = 'კამპუსში',
  Online = 'ონლაინ',
}
