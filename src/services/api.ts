const API_BASE_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'http://13.234.116.27:3000/api';

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

// Designations
export const designationApi = {
  getDesignations: async () => {
    const res = await apiFetch('/designations');
    return res.data || [];
  },
  createDesignation: async (name: string, description?: string) => {
    const res = await apiFetch('/designations', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    return res.data;
  },
  updateDesignation: async (id: number | string, name: string, description?: string) => {
    const res = await apiFetch(`/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
    return res.data;
  },
  deleteDesignation: async (id: number | string) => {
    const res = await apiFetch(`/designations/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Departments
export const departmentApi = {
  getDepartments: async () => {
    const res = await apiFetch('/departments');
    return res.data || [];
  },
  createDepartment: async (name: string, description?: string) => {
    const res = await apiFetch('/departments', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    return res.data;
  },
  updateDepartment: async (id: number | string, name: string, description?: string) => {
    const res = await apiFetch(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
    return res.data;
  },
  deleteDepartment: async (id: number | string) => {
    const res = await apiFetch(`/departments/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Admin Dashboard & Reports
export const adminApi = {
  getDashboardStats: async () => {
    const res = await apiFetch('/admin/dashboard');
    return res.data;
  },
  getAttendanceReport: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/admin/reports/attendance${query}`);
    return res.data;
  },
  getFeeReport: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/admin/reports/fees${query}`);
    return res.data;
  },
  getExamPerformanceReport: async (examId: number | string) => {
    const res = await apiFetch(`/admin/reports/exams/${examId}`);
    return res.data;
  },
  toggleUserStatus: async (userId: number | string, status: string) => {
    const res = await apiFetch(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  }
};

// Announcements
export const announcementApi = {
  getAnnouncements: async () => {
    const res = await apiFetch('/announcements');
    return res.data || [];
  },
  createAnnouncement: async (announcementData: any) => {
    const res = await apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData)
    });
    return res.data;
  },
  deleteAnnouncement: async (id: number | string) => {
    const res = await apiFetch(`/announcements/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};

// Notifications
export const notificationApi = {
  getMyNotifications: async () => {
    const res = await apiFetch('/notifications');
    return res.data || [];
  },
  getUnreadCount: async () => {
    const res = await apiFetch('/notifications/unread-count');
    return res.data?.unread_count || 0;
  },
  markRead: async (id: number | string) => {
    const res = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiFetch('/notifications/read-all', { method: 'PATCH' });
    return res.data;
  },
  broadcast: async (data: { user_ids: number[]; title: string; body: string; type?: string }) => {
    const res = await apiFetch('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }
};

// Events
export const eventApi = {
  getEvents: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/events${query}`);
    return res.data || [];
  },
  createEvent: async (eventData: any) => {
    const res = await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return res.data;
  },
  updateEvent: async (id: number | string, eventData: any) => {
    const res = await apiFetch(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    return res.data;
  },
  deleteEvent: async (id: number | string) => {
    const res = await apiFetch(`/events/${id}`, { method: 'DELETE' });
    return res.data;
  }
};

// Assignments
export const assignmentApi = {
  getAssignments: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/assignments${query}`);
    return res.data || [];
  },
  createAssignment: async (assignmentData: any) => {
    const res = await apiFetch('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
    return res.data;
  },
  getSubmissions: async (id: number | string) => {
    const res = await apiFetch(`/assignments/${id}/submissions`);
    return res.data || [];
  },
  gradeSubmission: async (submissionId: number | string, marks_obtained: number, feedback?: string) => {
    const res = await apiFetch(`/assignments/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ marks_obtained, feedback })
    });
    return res.data;
  }
};

// Leaves
export const leaveApi = {
  getLeaves: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/leaves${query}`);
    return res.data || [];
  },
  getMyLeaves: async () => {
    const res = await apiFetch('/leaves/my-leaves');
    return res.data || [];
  },
  createLeave: async (leaveData: any) => {
    const res = await apiFetch('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
    return res.data;
  },
  updateLeaveStatus: async (id: number | string, status: string, admin_remarks?: string) => {
    const res = await apiFetch(`/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_remarks })
    });
    return res.data;
  }
};

// Transport
export const transportApi = {
  getRoutes: async () => {
    const res = await apiFetch('/transport/routes');
    return res.data || [];
  },
  createRoute: async (routeData: any) => {
    const res = await apiFetch('/transport/routes', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
    return res.data;
  },
  updateLocation: async (id: number | string, current_latitude: number, current_longitude: number, status?: string) => {
    const res = await apiFetch(`/transport/routes/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ current_latitude, current_longitude, status })
    });
    return res.data;
  }
};

// Library
export const libraryApi = {
  getBooks: async (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiFetch(`/library/books${query}`);
    return res.data || [];
  },
  createBook: async (bookData: any) => {
    const res = await apiFetch('/library/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
    return res.data;
  },
  issueBook: async (issueData: any) => {
    const res = await apiFetch('/library/issue', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
    return res.data;
  },
  returnBook: async (issueId: number | string, fineAmount: number = 0) => {
    const res = await apiFetch(`/library/return/${issueId}`, {
      method: 'POST',
      body: JSON.stringify({ fine_amount: fineAmount })
    });
    return res.data;
  }
};

// Resources
export const resourceApi = {
  getResources: async (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await apiFetch(`/resources${query}`);
    return res.data || [];
  },
  createResource: async (resourceData: any) => {
    const res = await apiFetch('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
    return res.data;
  },
  deleteResource: async (id: number | string) => {
    const res = await apiFetch(`/resources/${id}`, { method: 'DELETE' });
    return res.data;
  }
};

// Gallery
export const galleryApi = {
  getAlbums: async () => {
    const res = await apiFetch('/gallery/albums');
    return res.data || [];
  },
  createAlbum: async (albumData: any) => {
    const res = await apiFetch('/gallery/albums', {
      method: 'POST',
      body: JSON.stringify(albumData)
    });
    return res.data;
  },
  addMedia: async (albumId: number | string, media: any[]) => {
    const res = await apiFetch(`/gallery/albums/${albumId}/media`, {
      method: 'POST',
      body: JSON.stringify({ media })
    });
    return res.data;
  }
};

// Polls
export const pollApi = {
  getPolls: async () => {
    const res = await apiFetch('/polls');
    return res.data || [];
  },
  createPoll: async (pollData: { question: string; options: string[] }) => {
    const res = await apiFetch('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData)
    });
    return res.data;
  },
  vote: async (id: number | string, optionId: number) => {
    const res = await apiFetch(`/polls/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId })
    });
    return res.data;
  },
  getResults: async (id: number | string) => {
    const res = await apiFetch(`/polls/${id}/results`);
    return res.data;
  },
  closePoll: async (id: number | string) => {
    const res = await apiFetch(`/polls/${id}/close`, { method: 'PATCH' });
    return res.data;
  }
};

// Chat
export const chatApi = {
  getConversations: async () => {
    const res = await apiFetch('/chat/conversations');
    return res.data || [];
  },
  startConversation: async (recipientId: number | string) => {
    const res = await apiFetch('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId })
    });
    return res.data;
  },
  getMessages: async (conversationId: number | string) => {
    const res = await apiFetch(`/chat/conversations/${conversationId}/messages`);
    return res.data || [];
  },
  sendMessage: async (conversationId: number | string, text: string) => {
    const res = await apiFetch(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message_text: text })
    });
    return res.data;
  }
};

