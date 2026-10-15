import React, { useState } from 'react';
import { StudentProvider, useStudentContext } from './context/StudentContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { AIInsights } from './components/AIInsights';
import { StudyRecommendations } from './components/StudyRecommendations';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { StudentModal } from './components/StudentModal';
import { CSVImportModal } from './components/CSVImportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { Student } from './types';

function AppContent() {
  const {
    students,
    allStudents,
    settings,
    classAnalytics,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    selectedStudentForProfile,
    setSelectedStudentForProfile,
    fetchStudentStudyPlan,
  } = useStudentContext();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Actions
  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (savedStudent: Student) => {
    if (studentToEdit) {
      updateStudent(savedStudent);
    } else {
      addStudent(savedStudent);
    }
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const existingIds = allStudents.map((s) => s.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAdd}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          supportFlagCount={classAnalytics.studentsNeedingSupportCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAddModal={handleOpenAdd}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {currentTab === 'students' && (
            <StudentManagement
              onOpenAddModal={handleOpenAdd}
              onEditStudent={handleEdit}
              onDeleteRequest={(s) => setStudentToDelete(s)}
              onSelectStudentForProfile={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {currentTab === 'analytics' && (
            <PerformanceAnalytics
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {currentTab === 'insights' && <AIInsights />}

          {currentTab === 'recommendations' && (
            <StudyRecommendations
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {currentTab === 'reports' && (
            <Reports
              onSelectStudent={(s) => setSelectedStudentForProfile(s)}
            />
          )}

          {currentTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        settings={settings}
        existingIds={existingIds}
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(newStudents, mode) => importStudents(newStudents, mode)}
        settings={settings}
      />

      <DeleteConfirmModal
        student={studentToDelete}
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <StudentProfileModal
        student={selectedStudentForProfile}
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        onEdit={(s) => {
          setSelectedStudentForProfile(null);
          handleEdit(s);
        }}
        settings={settings}
        classAnalytics={classAnalytics}
        onFetchPlan={fetchStudentStudyPlan}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <AppContent />
    </StudentProvider>
  );
}
