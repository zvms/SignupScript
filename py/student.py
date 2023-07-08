from typing import Set, Union

Student = int
Class = int
Grade = int

conv = {
    "classOfStudent": lambda s: s // 100,
    "gradeOfStudent": lambda s: (s // 10) % 10,
    "gradeOfClass": lambda c: (c // 10) % 10
}

class Union:
    def __init__(self, grades: Set[Grade], classes: Set[Class], students: Set[Student]):
        self.grades = grades
        self.classes = classes
        self.students = students
    
    @property
    def length(self) -> int:
        return 0
    
    @staticmethod
    def fromLiteral(literal: int) -> "Union":
        literal = int(literal)
        if 2000 < literal <= 9999:
            return Union({literal}, set(), set())
        if 1000_00 <= literal <= 9999_99:
            return Union(set(), {literal}, set())
        if 1000_00_00 <= literal <= 9999_99_99:
            return Union(set(), set(), {literal})
        raise ValueError(f"\"{literal}\" 不是一个学生集合")
    
    @staticmethod
    def intersect(a: "Union", b: "Union") -> "Union":
        grades = a.grades & b.grades
        classes = set()
        for classA in a.classes:
            if classA in b.classes:
                classes.add(classA)
            elif conv["gradeOfClass"](classA) in b.grades:
                classes.add(classA)
        students = set()
        for studentA in a.students:
            if studentA in b.students:
                students.add(studentA)
            elif conv["classOfStudent"](studentA) in b.classes:
                students.add(studentA)
            elif conv["gradeOfStudent"](studentA) in b.grades:
                students.add(studentA)
        return Union(grades, classes, students)
    
    @staticmethod
    def union(a: "Union", b: "Union") -> "Union":
        grades = a.grades | b.grades
        classes = a.classes | b.classes
        students = a.students | b.students
        return Union(grades, classes, students)
    
    @staticmethod
    def addStudent(u: "Union", s: Student) -> "Union":
        grades = u.grades
        classes = u.classes
        students = u.students | {s}
        return Union(grades, classes, students)
    
    @staticmethod
    def addClass(u: "Union", c: Class) -> "Union":
        grades = u.grades
        classes = u.classes | {c}
        students = u.students
        return Union(grades, classes, students)
    
    @staticmethod
    def addGrade(u: "Union", g: Grade) -> "Union":
        grades = u.grades | {g}
        classes = u.classes
        students = u.students
        return Union(grades, classes, students)