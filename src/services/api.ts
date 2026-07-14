const API_BASE_URL = 'http://localhost:3000/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: headers as HeadersInit
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }

  if (response.status === 401 && path !== '/users/login' && path !== '/users/register') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('unauthorized'));
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Authentication
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return res.data; // returns { token, user }
  },
  register: async (userData: any) => {
    const res = await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return res.data;
  }
};

// Classes and Sections
export const classApi = {
  getClasses: async () => {
    const res = await apiFetch('/classes');
    return res.data || [];
  },
  createClass: async (name: string) => {
    const res = await apiFetch('/classes', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    return res.data;
  },
  createSection: async (classId: number, name: string) => {
    const res = await apiFetch('/classes/sections', {
      method: 'POST',
      body: JSON.stringify({ class_id: classId, name })
    });
    return res.data;
  },
  getSections: async (classId?: number) => {
    const query = classId ? `?class_id=${classId}` : '';
    const res = await apiFetch(`/classes/sections${query}`);
    return res.data || [];
  },
  deleteClass: async (id: number | string) => {
    const res = await apiFetch(`/classes/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  },
  deleteSection: async (id: number | string) => {
    const res = await apiFetch(`/classes/sections/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  },
  updateClass: async (id: number | string, name: string) => {
    const res = await apiFetch(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    return res.data;
  },
  updateSection: async (id: number | string, name: string) => {
    const res = await apiFetch(`/classes/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    return res.data;
  }
};

// Teachers
export const teacherApi = {
  getTeachers: async () => {
    const res = await apiFetch('/teachers');
    return res.data || [];
  },
  createTeacher: async (teacherData: any) => {
    const res = await apiFetch('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
    return res.data;
  },
  updateTeacher: async (id: number | string, teacherData: any) => {
    const res = await apiFetch(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
    return res.data;
  },
  deleteTeacher: async (id: number | string) => {
    const res = await apiFetch(`/teachers/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Students
export const studentApi = {
  getStudents: async (classId?: number | string, sectionId?: number | string) => {
    let query = '';
    const params = new URLSearchParams();
    if (classId) params.append('class_id', String(classId));
    if (sectionId) params.append('section_id', String(sectionId));
    if (params.toString()) query = `?${params.toString()}`;

    const res = await apiFetch(`/students${query}`);
    return res.data || [];
  },
  createStudent: async (studentData: any) => {
    const res = await apiFetch('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    return res.data;
  },
  updateStudent: async (id: number | string, studentData: any) => {
    const res = await apiFetch(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
    return res.data;
  },
  deleteStudent: async (id: number | string) => {
    const res = await apiFetch(`/students/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Exams and Marks
export const examApi = {
  getExams: async (classId?: number | string) => {
    const query = classId ? `?class_id=${classId}` : '';
    const res = await apiFetch(`/exams${query}`);
    return res.data || [];
  },
  createExam: async (examData: any) => {
    const res = await apiFetch('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
    return res.data;
  },
  getMarks: async (examId: number | string, subjectId?: number | string) => {
    const query = subjectId ? `?subject_id=${subjectId}` : '';
    const res = await apiFetch(`/exams/${examId}/marks${query}`);
    return res.data || [];
  },
  recordMarks: async (examId: number | string, subjectId: number | string, records: any[]) => {
    const res = await apiFetch(`/exams/${examId}/marks`, {
      method: 'POST',
      body: JSON.stringify({ subject_id: Number(subjectId), records })
    });
    return res.data;
  }
};

// Fees
export const feeApi = {
  getFees: async (studentId?: number | string, status?: string) => {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', String(studentId));
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await apiFetch(`/fees${query}`);
    return res.data || [];
  },
  createFee: async (feeData: any) => {
    const res = await apiFetch('/fees', {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
    return res.data;
  },
  updateFeeStatus: async (id: number | string, status: string) => {
    const res = await apiFetch(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return res.data;
  }
};

// Schools
export const schoolApi = {
  getSchools: async () => {
    const res = await apiFetch('/schools');
    return res.data || [];
  },
  createSchool: async (schoolData: any) => {
    const res = await apiFetch('/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData)
    });
    return res.data;
  },
  updateSchool: async (id: number | string, schoolData: any) => {
    const res = await apiFetch(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schoolData)
    });
    return res.data;
  },
  deleteSchool: async (id: number | string) => {
    const res = await apiFetch(`/schools/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Subjects
export const subjectApi = {
  getSubjects: async (classId?: number | string) => {
    const query = classId ? `?class_id=${classId}` : '';
    const res = await apiFetch(`/subjects${query}`);
    return res.data || [];
  },
  createSubject: async (subjectData: any) => {
    const res = await apiFetch('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
    return res.data;
  },
  updateSubject: async (id: number | string, subjectData: any) => {
    const res = await apiFetch(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData)
    });
    return res.data;
  },
  deleteSubject: async (id: number | string) => {
    const res = await apiFetch(`/subjects/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
