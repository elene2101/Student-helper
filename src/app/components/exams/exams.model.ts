export interface Exam {
  id?: string;
  name: string;
  subjectId: string;
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
