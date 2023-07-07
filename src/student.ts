export type Student = number | (number & { __student__: string });
export type Class = number | (number & { __class__: never });
export type Grade = number | (number & { __grade__: never });

export const conv = {
  classOfStudent(s: Student): Class {
    return Math.floor(s / 100);
  },
  gradeOfStudent(s: Student): Grade {
    return Math.floor(s / 10) % 10;
  },
  gradeOfClass(c: Class): Grade {
    return Math.floor(c / 10) % 10;
  },
};

export class Union {
  constructor(
    public grades: Set<Grade>,
    public classes: Set<Class>,
    public students: Set<Student>
  ) {}

  get length(): number {
    return 0;
  }

  static fromLiteral(literal: number): Union {
    literal = Math.floor(literal);
    if (2000 < literal && literal <= 9999) {
      return new Union(new Set([literal]), new Set(), new Set());
    }
    if (1000_00 <= literal && literal <= 9999_99) {
      return new Union(new Set(), new Set([literal]), new Set());
    }
    if (1000_00_00 <= literal && literal <= 9999_99_99) {
      return new Union(new Set(), new Set(), new Set([literal]));
    }
    throw new Error(`${literal} is not a valid union literal`);
  }

  static intersect(a: Union, b: Union): Union {
    const grades = new Set<Grade>();
    for (const gradeA of a.grades) {
      if (b.grades.has(gradeA)) {
        grades.add(gradeA);
      }
    }
    const classes = new Set<Class>();
    for (const classA of a.classes) {
      if (b.classes.has(classA)) {
        classes.add(classA);
      } else if (b.grades.has(conv.gradeOfClass(classA))) {
        classes.add(classA);
      }
    }
    const students = new Set<Student>();
    for (const studentA of a.students) {
      if (b.students.has(studentA)) {
        students.add(studentA);
      } else if (b.classes.has(conv.classOfStudent(studentA))) {
        students.add(studentA);
      }
    }
    return new Union(grades, classes, students);
  }
  static union(a: Union, b: Union): Union {
    return new Union(
      new Set([...a.grades, ...b.grades]),
      new Set([...a.classes, ...b.classes]),
      new Set([...a.students, ...b.students])
    );
  }
  static addStudnet(u: Union, s: Student): Union {
    return new Union(
      new Set(u.grades),
      new Set(u.classes),
      new Set([...u.students, s])
    );
  }
  static addClass(u: Union, c: Class): Union {
    return new Union(
      new Set(u.grades),
      new Set([...u.classes, c]),
      new Set(u.students)
    );
  }
  static addGrade(u: Union, g: Grade): Union {
    return new Union(
      new Set([...u.grades, g]),
      new Set(u.classes),
      new Set(u.students)
    );
  }
}
